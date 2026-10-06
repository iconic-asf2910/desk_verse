package gaming

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func collection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("gaming")
}

func getUserID(r *http.Request) string {
	val := r.Context().Value(middleware.UserIDKey)
	if val == nil {
		return ""
	}
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}

func HandleGaming(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateSession(w, r)
	case http.MethodGet:
		ListSessions(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func HandleGamingByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetSession(w, r)
	case http.MethodPut:
		JoinLeaveSession(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func CreateSession(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		WorkspaceID string `json:"workspaceId"`
		Name        string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.WorkspaceID == "" {
		http.Error(w, "workspaceId required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		http.Error(w, "name required", http.StatusBadRequest)
		return
	}

	if !isUserInWorkspace(userID, req.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}

	col := collection()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	session := &models.GamingSession{
		WorkspaceID: req.WorkspaceID,
		Name:        strings.TrimSpace(req.Name),
		HostID:      userID,
		Players:     []string{userID},
		Status:      "open",
		CreatedAt:   time.Now(),
	}

	result, err := col.InsertOne(ctx, session)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		session.ID = oid.Hex()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(session)
}

func ListSessions(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.URL.Query().Get("workspaceId")
	if workspaceID == "" {
		http.Error(w, "workspaceId required", http.StatusBadRequest)
		return
	}

	if !isUserInWorkspace(userID, workspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}

	col := collection()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"workspaceId": workspaceID}
	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.M{"createdAt": -1}))
	if err != nil {
		http.Error(w, "Failed to list sessions", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var sessions []models.GamingSession
	if err := cursor.All(ctx, &sessions); err != nil {
		http.Error(w, "Failed to read sessions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

func GetSession(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getSessionIDFromPath(r)
	if id == "" {
		http.Error(w, "Session ID required", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}

	col := collection()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var session models.GamingSession
	err := col.FindOne(ctx, bson.M{"_id": parseObjectID(id)}).Decode(&session)
	if err != nil {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&session)
	}
	if err != nil {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, session.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}

func JoinLeaveSession(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getSessionIDFromPath(r)
	if id == "" {
		http.Error(w, "Session ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Action string `json:"action"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Action != "join" && req.Action != "leave" {
		http.Error(w, "action must be join or leave", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}

	col := collection()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var session models.GamingSession
	filter := bson.M{"_id": parseObjectID(id)}
	err := col.FindOne(ctx, filter).Decode(&session)
	if err != nil {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&session)
	}
	if err != nil {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, session.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	if req.Action == "join" {
		for _, p := range session.Players {
			if p == userID {
				http.Error(w, "Already joined", http.StatusBadRequest)
				return
			}
		}
		session.Players = append(session.Players, userID)
		_, err = col.UpdateOne(ctx, filter, bson.M{"$push": bson.M{"players": userID}})
		if err != nil {
			http.Error(w, "Failed to join", http.StatusInternalServerError)
			return
		}
	} else {
		found := false
		newPlayers := []string{}
		for _, p := range session.Players {
			if p == userID {
				found = true
			} else {
				newPlayers = append(newPlayers, p)
			}
		}
		if !found {
			http.Error(w, "Not in session", http.StatusBadRequest)
			return
		}
		_, err = col.UpdateOne(ctx, filter, bson.M{"$set": bson.M{"players": newPlayers}})
		if err != nil {
			http.Error(w, "Failed to leave", http.StatusInternalServerError)
			return
		}
		session.Players = newPlayers
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(session)
}

func getSessionIDFromPath(r *http.Request) string {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) >= 2 {
		return parts[len(parts)-1]
	}
	return ""
}

func parseObjectID(id string) interface{} {
	oid, err := bson.ObjectIDFromHex(id)
	if err == nil {
		return oid
	}
	return id
}

func isUserInWorkspace(userID string, workspaceID string) bool {
	if workspaceID == "" || userID == "" {
		return false
	}
	if db.DB == nil {
		if err := db.Connect(); err != nil {
			return false
		}
	}
	col := db.DB.Collection("workspaces")
	if col == nil {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(workspaceID)
	if err != nil {
		var ws models.Workspace
		err = col.FindOne(ctx, bson.M{"_id": workspaceID}).Decode(&ws)
		if err != nil {
			return false
		}
		for _, m := range ws.Members {
			if m == userID {
				return true
			}
		}
		return ws.OwnerID == userID
	}
	var ws models.Workspace
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&ws)
	if err != nil {
		return false
	}
	for _, m := range ws.Members {
		if m == userID {
			return true
		}
	}
	return ws.OwnerID == userID
}

func init() {
	if db.DB != nil {
		col := db.DB.Collection("gaming")
		col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
			Keys: bson.D{{Key: "workspaceId", Value: 1}, {Key: "createdAt", Value: -1}},
		})
	}
}
