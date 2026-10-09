package presence

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

func collection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("presence")
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

// HandlePresence handles GET /api/presence/:id and PUT /api/presence/:id/status
func HandlePresence(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetPresence(w, r)
	case http.MethodPut:
		UpdatePresenceStatus(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// GetPresence retrieves a user's presence status.
// GET /api/presence/:id?workspaceId=...
func GetPresence(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getPresenceIDFromPath(r)
	if id == "" {
		// If no ID in path, return requesting user's presence
		id = userID
	}

	var workspaceID string
	wksp := r.URL.Query().Get("workspaceId")
	if wksp != "" {
		if !isUserInWorkspace(userID, wksp) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}
		workspaceID = wksp
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

	var presence models.Presence
	filter := bson.M{"userId": parseObjectID(id)}
	if workspaceID != "" {
		filter["workspaceId"] = workspaceID
	}

	err := col.FindOne(ctx, filter).Decode(&presence)
	if err != nil {
		// Return a default presence if not found (user not yet tracked)
		presence = models.Presence{
			UserID:      id,
			WorkspaceID: workspaceID,
			Status:      models.StatusOffline,
			LastSeen:    time.Time{},
			UpdatedAt:   time.Now(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(presence)
		return
	}

	if !isUserInWorkspace(userID, presence.UserID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(presence)
}

// UpdatePresenceStatus updates a user's status (online/away/offline).
// PUT /api/presence/:id/status
func UpdatePresenceStatus(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getPresenceIDFromPath(r)
	if id == "" {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	// Only allow users to update their own presence
	if id != userID {
		http.Error(w, "Can only update your own presence", http.StatusForbidden)
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Status != models.StatusOnline && req.Status != models.StatusAway && req.Status != models.StatusOffline {
		http.Error(w, "invalid status", http.StatusBadRequest)
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

	updatedAt := time.Now()

	// Upsert: create or update the presence record
	_, err := col.UpdateOne(ctx,
		bson.M{"userId": parseObjectID(id)},
		bson.M{
			"$set": bson.M{
				"status":    req.Status,
				"lastSeen":  time.Now(),
				"updatedAt": updatedAt,
			},
		},
	)
	if err != nil {
		http.Error(w, "Failed to update presence", http.StatusInternalServerError)
		return
	}

	presence := models.Presence{
		UserID:    id,
		Status:    req.Status,
		LastSeen:  time.Now(),
		UpdatedAt: updatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(presence)
}

func getPresenceIDFromPath(r *http.Request) string {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) >= 2 {
		id := parts[len(parts)-1]
		// Strip trailing "/status" suffix from PUT /api/presence/:id/status
		if id == "status" && len(parts) >= 3 {
			return parts[len(parts)-2]
		}
		return id
	}
	return ""
}

// isUserInWorkspace checks membership via the workspace collection,
// reusing the existing pattern from task/message middleware.
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

func parseObjectID(id string) interface{} {
	oid, err := bson.ObjectIDFromHex(id)
	if err == nil {
		return oid
	}
	return id
}
