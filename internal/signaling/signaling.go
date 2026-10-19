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
	"github.com/iconic-asf2910/vow/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}

		allowedOrigins := map[string]bool{
			"http://localhost:5173": true,
		}

		return allowedOrigins[origin] ||
			strings.HasSuffix(origin, ".vercel.app") &&
				strings.HasPrefix(origin, "https://")
	},
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

func (h *Hub) broadcast(meetingID string, msg Message, exclude *Client) {
	h.mu.RLock()
	clients := make([]*Client, 0, len(h.clients[meetingID]))

	for client := range h.clients[meetingID] {
		if client != exclude {
			clients = append(clients, client)
		}
	}
	h.mu.RUnlock()

	for _, client := range clients {
		client.conn.SetWriteDeadline(time.Now().Add(2 * time.Second))

		if err := client.conn.WriteJSON(msg); err != nil {
			client.conn.Close()
			h.unregister(client)
		}
	}
}

func (h *Hub) sendToTarget(meetingID string, msg Message, targetUserID string) {
	h.mu.RLock()
	targetClients := make([]*Client, 0)

	for client := range h.clients[meetingID] {
		if client.userID == targetUserID {
			targetClients = append(targetClients, client)
		}
	}
	h.mu.RUnlock()

	for _, client := range targetClients {
		client.conn.SetWriteDeadline(time.Now().Add(2 * time.Second))

		if err := client.conn.WriteJSON(msg); err != nil {
			client.conn.Close()
			h.unregister(client)
		}
	}
}

func HandleWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	userID := ""

	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			claims := &auth.Claims{}
			token, err := auth.ParseToken(parts[1], claims)

			if err == nil && token.Valid {
				userID = claims.UserID
			}
		}
	}

	if userID == "" {
		tokenString := r.URL.Query().Get("token")

		if tokenString != "" {
			claims := &auth.Claims{}
			token, err := auth.ParseToken(tokenString, claims)

			if err == nil && token.Valid {
				userID = claims.UserID
			}
		}
	}

	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	meetingID := ""

	for i, part := range pathParts {
		if part == "meetings" && i+1 < len(pathParts) {
			meetingID = pathParts[i+1]
			break
		}
	}

	if meetingID == "" {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	col := db.DB.Collection("meetings")
	var mtg models.Meeting

	objectID, err := bson.ObjectIDFromHex(meetingID)

	if err == nil {
		err = col.FindOne(ctx, bson.M{"_id": objectID}).Decode(&mtg)
	} else {
		err = col.FindOne(ctx, bson.M{"meetingCode": meetingID}).Decode(&mtg)
	}

	if err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	authorized := meeting.IsUserAuthorizedForMeeting(&mtg, userID)

	if !authorized {
		for _, request := range mtg.JoinRequests {
			if request.UserID == userID && request.Status == "approved" {
				authorized = true
				break
			}
		}
	}

	if !authorized {
		http.Error(w, "Access denied: host approval required", http.StatusForbidden)
		return
	}

	canonicalMeetingID := mtg.ID.Hex()

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	client := &Client{
		conn:    conn,
		userID:  userID,
		meeting: canonicalMeetingID,
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
			msg.Meeting = canonicalMeetingID
			hub.broadcast(canonicalMeetingID, msg, client)

		case "offer", "answer", "ice":
			msg.UserID = userID
			msg.Meeting = canonicalMeetingID

			if msg.Target != "" {
				hub.sendToTarget(canonicalMeetingID, msg, msg.Target)
			} else {
				hub.broadcast(canonicalMeetingID, msg, client)
			}

		case "leave":
			msg.UserID = userID
			msg.Meeting = canonicalMeetingID
			hub.broadcast(canonicalMeetingID, msg, client)
		}
	}
}
