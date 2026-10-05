package message

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
	return db.DB.Collection("messages")
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

func HandleMessages(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateMessage(w, r)
	case http.MethodGet:
		ListMessages(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func HandleMessageByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetMessage(w, r)
	case http.MethodPut:
		UpdateMessage(w, r)
	case http.MethodDelete:
		DeleteMessage(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func CreateMessage(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		WorkspaceID string `json:"workspaceId"`
		RoomID      string `json:"roomId"`
		Content     string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.WorkspaceID == "" {
		http.Error(w, "workspaceId required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Content) == "" {
		http.Error(w, "content required", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}

	if !isUserInWorkspace(userID, req.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	if req.RoomID != "" {
		if !roomExists(req.RoomID, req.WorkspaceID) {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}
	}

	col := collection()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	msg := &models.Message{
		WorkspaceID: req.WorkspaceID,
		RoomID:      req.RoomID,
		SenderID:    userID,
		Content:     strings.TrimSpace(req.Content),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result, err := col.InsertOne(ctx, msg)
	if err != nil {
		http.Error(w, "Failed to create message", http.StatusInternalServerError)
		return
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		msg.ID = oid.Hex()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(msg)
}

func ListMessages(w http.ResponseWriter, r *http.Request) {
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

	roomID := r.URL.Query().Get("roomId")

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
	if roomID != "" {
		filter["roomId"] = roomID
	}

	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.M{"createdAt": 1}))
	if err != nil {
		http.Error(w, "Failed to list messages", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err := cursor.All(ctx, &messages); err != nil {
		http.Error(w, "Failed to read messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func GetMessage(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMessageIDFromPath(r)
	if id == "" {
		http.Error(w, "Message ID required", http.StatusBadRequest)
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

	var msg models.Message
	err := col.FindOne(ctx, bson.M{"_id": parseObjectID(id)}).Decode(&msg)
	if err != nil {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&msg)
	}
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, msg.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

func UpdateMessage(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMessageIDFromPath(r)
	if id == "" {
		http.Error(w, "Message ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Content) == "" {
		http.Error(w, "content required", http.StatusBadRequest)
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

	var msg models.Message
	var objID bson.ObjectID
	objID, err := bson.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	if err != nil {
		filter = bson.M{"_id": id}
	}

	err = col.FindOne(ctx, filter).Decode(&msg)
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	if msg.SenderID != userID {
		http.Error(w, "Access denied: not message owner", http.StatusForbidden)
		return
	}

	_, err = col.UpdateOne(ctx, filter, bson.M{"$set": bson.M{"content": strings.TrimSpace(req.Content), "updatedAt": time.Now()}})
	if err != nil {
		http.Error(w, "Failed to update message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

func DeleteMessage(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMessageIDFromPath(r)
	if id == "" {
		http.Error(w, "Message ID required", http.StatusBadRequest)
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

	var msg models.Message
	var objID bson.ObjectID
	objID, err := bson.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	if err != nil {
		filter = bson.M{"_id": id}
	}

	err = col.FindOne(ctx, filter).Decode(&msg)
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	if msg.SenderID != userID {
		http.Error(w, "Access denied: not message owner", http.StatusForbidden)
		return
	}

	_, err = col.DeleteOne(ctx, filter)
	if err != nil {
		http.Error(w, "Failed to delete message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func isUserInWorkspace(userID string, workspaceID string) bool {
	if workspaceID == "" || userID == "" {
		return false
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

func roomExists(roomID string, workspaceID string) bool {
	if roomID == "" || workspaceID == "" {
		return false
	}
	col := db.DB.Collection("rooms")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(roomID)
	if err != nil {
		var rm models.Room
		err = col.FindOne(ctx, bson.M{"_id": roomID, "workspaceId": workspaceID}).Decode(&rm)
		return err == nil
	}
	var rm models.Room
	err = col.FindOne(ctx, bson.M{"_id": objID, "workspaceId": workspaceID}).Decode(&rm)
	return err == nil
}

func getMessageIDFromPath(r *http.Request) string {
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

func init() {
	if db.DB != nil {
		col := db.DB.Collection("messages")
		col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
			Keys: bson.D{{Key: "workspaceId", Value: 1}, {Key: "createdAt", Value: 1}},
		})
		col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
			Keys: bson.D{{Key: "roomId", Value: 1}},
		})
	}
}
