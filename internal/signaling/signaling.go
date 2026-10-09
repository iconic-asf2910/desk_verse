package signaling

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/iconic-asf2910/vow/internal/auth"
	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/meeting"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(r *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	conn    *websocket.Conn
	userID  string
	meeting string
	hub     *Hub
}

type Message struct {
	Type    string          `json:"type"`
	Meeting string          `json:"meeting"`
	Target  string          `json:"target,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
	UserID  string          `json:"userId,omitempty"`
}

type Hub struct {
	clients map[string]map[*Client]bool
	mu      sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[string]map[*Client]bool),
	}
}

func (h *Hub) register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[client.meeting] == nil {
		h.clients[client.meeting] = make(map[*Client]bool)
	}
	h.clients[client.meeting][client] = true
}

func (h *Hub) unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[client.meeting] != nil {
		delete(h.clients[client.meeting], client)
		if len(h.clients[client.meeting]) == 0 {
			delete(h.clients, client.meeting)
		}
	}
}

func (h *Hub) broadcast(meeting string, msg Message, exclude *Client) {
	h.mu.RLock()
	clients := make([]*Client, 0, len(h.clients[meeting]))
	for c := range h.clients[meeting] {
		if c != exclude {
			clients = append(clients, c)
		}
	}
	h.mu.RUnlock()

	for _, c := range clients {
		c.conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
		err := c.conn.WriteJSON(msg)
		if err != nil {
			c.conn.Close()
			h.unregister(c)
		}
	}
}

func (h *Hub) sendToTarget(meeting string, msg Message, targetUserID string) {
	h.mu.RLock()
	targetClients := make([]*Client, 0)
	for c := range h.clients[meeting] {
		if c.userID == targetUserID {
			targetClients = append(targetClients, c)
		}
	}
	h.mu.RUnlock()

	for _, c := range targetClients {
		c.conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
		err := c.conn.WriteJSON(msg)
		if err != nil {
			c.conn.Close()
			h.unregister(c)
		}
	}
}

func HandleWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	userID := ""

	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			claims := &auth.Claims{}
			token, err := auth.ParseToken(parts[1], claims)
			if err == nil && token.Valid {
				userID = claims.UserID
				r = r.WithContext(middleware.AddUserToContext(r.Context(), userID))
			}
		}
	}

	if userID == "" {
		qs := r.URL.Query()
		tokenStr := qs.Get("token")
		if tokenStr != "" {
			claims := &auth.Claims{}
			token, err := auth.ParseToken(tokenStr, claims)
			if err == nil && token.Valid {
				userID = claims.UserID
				r = r.WithContext(middleware.AddUserToContext(r.Context(), userID))
			}
		}
	}

	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	path := r.URL.Path
	parts := strings.Split(path, "/")
	meetingID := ""
	for i, p := range parts {
		if p == "meetings" && i+1 < len(parts) {
			meetingID = parts[i+1]
			break
		}
	}
	if meetingID == "" || strings.Contains(meetingID, "/") {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}

	col := db.DB.Collection("meetings")
	var mtg models.Meeting
	var objID bson.ObjectID
	var findErr error
	objID, findErr = bson.ObjectIDFromHex(meetingID)
	if findErr == nil {
		findErr = col.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&mtg)
	}
	if findErr != nil {
		findErr = col.FindOne(context.Background(), bson.M{"meetingCode": meetingID}).Decode(&mtg)
	}
	if findErr == nil {
		if !meeting.IsUserAuthorizedForMeeting(&mtg, userID) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}
	} else {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	client := &Client{
		conn:    conn,
		userID:  userID,
		meeting: meetingID,
		hub:     hub,
	}
	hub.register(client)

	defer func() {
		hub.unregister(client)
		conn.Close()
	}()

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(raw, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "join":
			msg.UserID = userID
			hub.broadcast(meetingID, msg, client)
		case "offer", "answer", "ice":
			msg.UserID = userID
			if msg.Target != "" {
				hub.sendToTarget(meetingID, msg, msg.Target)
			} else {
				hub.broadcast(meetingID, msg, client)
			}
		case "leave":
			msg.UserID = userID
			hub.broadcast(meetingID, msg, client)
		}
	}
}
