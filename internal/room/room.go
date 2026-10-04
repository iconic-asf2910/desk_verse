package room

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
)

func HandleRooms(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateRoom(w, r)
	case http.MethodGet:
		ListRooms(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func HandleRoomByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetRoom(w, r)
	case http.MethodPut:
		UpdateRoom(w, r)
	case http.MethodDelete:
		DeleteRoom(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func collection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("rooms")
}

func workspaceCollection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("workspaces")
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

func getWorkspaceIDFromPath(r *http.Request) string {
	path := r.URL.Path
	// Extract workspaceId from path like /api/workspaces/{workspaceId}/rooms
	parts := strings.Split(path, "/")
	if len(parts) >= 4 && parts[1] == "api" && parts[2] == "workspaces" {
		return parts[3]
	}
	return ""
}

func getRoomIDFromPath(r *http.Request) string {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) >= 2 {
		return parts[len(parts)-1]
	}
	return ""
}

func isUserInWorkspace(userID string, workspaceID string) bool {
	if workspaceID == "" || userID == "" {
		return false
	}
	col := workspaceCollection()
	if col == nil {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := bson.ObjectIDFromHex(workspaceID)
	if err != nil {
		// Try to find by workspaceId string if ID isn't an ObjectID
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

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := getWorkspaceIDFromPath(r)
	if workspaceID == "" {
		http.Error(w, "Workspace ID required", http.StatusBadRequest)
		return
	}

	if !isUserInWorkspace(userID, workspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Type        string `json:"type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Name) == "" {
		http.Error(w, "Room name is required", http.StatusBadRequest)
		return
	}

	if req.Type == "" {
		req.Type = "general"
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rm := &models.Room{
		WorkspaceID: workspaceID,
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		CreatedBy:   userID,
		Members:     []string{userID},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	col := collection()
	result, err := col.InsertOne(ctx, rm)
	if err != nil {
		http.Error(w, "Failed to create room", http.StatusInternalServerError)
		return
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		rm.ID = oid
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(rm)
}

func ListRooms(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := getWorkspaceIDFromPath(r)
	if workspaceID == "" {
		http.Error(w, "Workspace ID required", http.StatusBadRequest)
		return
	}

	if !isUserInWorkspace(userID, workspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	col := collection()
	cursor, err := col.Find(ctx, bson.M{"workspaceId": workspaceID})
	if err != nil {
		http.Error(w, "Failed to list rooms", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var rooms []models.Room
	if err := cursor.All(ctx, &rooms); err != nil {
		http.Error(w, "Failed to read rooms", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rooms)
}

func GetRoom(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getRoomIDFromPath(r)
	if id == "" {
		http.Error(w, "Room ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	col := collection()
	var rm models.Room
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&rm)
	if err != nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, rm.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rm)
}

func UpdateRoom(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getRoomIDFromPath(r)
	if id == "" {
		http.Error(w, "Room ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		Type        string   `json:"type"`
		Members     []string `json:"members"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	col := collection()
	var rm models.Room
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&rm)
	if err != nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, rm.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	update := bson.M{"updatedAt": time.Now()}
	if req.Name != "" {
		update["name"] = req.Name
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.Type != "" {
		update["type"] = req.Type
	}
	if req.Members != nil {
		update["members"] = req.Members
	}

	_, err = col.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	if err != nil {
		http.Error(w, "Failed to update room", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

func DeleteRoom(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getRoomIDFromPath(r)
	if id == "" {
		http.Error(w, "Room ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	col := collection()
	var rm models.Room
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&rm)
	if err != nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	if rm.CreatedBy != userID {
		http.Error(w, "Access denied: Only creator can delete room", http.StatusForbidden)
		return
	}

	if !isUserInWorkspace(userID, rm.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	_, err = col.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Failed to delete room", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
