package workspace

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"
)

func HandleWorkspaces(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateWorkspace(w, r)
	case http.MethodGet:
		ListWorkspaces(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func HandleWorkspaceByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetWorkspace(w, r)
	case http.MethodPut, http.MethodPatch:
		UpdateWorkspace(w, r)
	case http.MethodDelete:
		DeleteWorkspace(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func collection() *mongo.Collection {
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

func getRole(r *http.Request) string {
	val := r.Context().Value(middleware.RoleKey)
	if val == nil {
		return ""
	}
	if s, ok := val.(string); ok {
		return s
	}
	return ""
}

func isMemberOrOwner(r *http.Request, ws *models.Workspace) bool {
	userID := getUserID(r)
	if userID == "" {
		return false
	}
	if ws.OwnerID == userID {
		return true
	}
	for _, m := range ws.Members {
		if m == userID {
			return true
		}
	}
	return false
}

func isOwnerOrAuthorized(r *http.Request, ws *models.Workspace) bool {
	userID := getUserID(r)
	if userID == "" {
		return false
	}
	if ws.OwnerID == userID {
		return true
	}
	role := getRole(r)
	if role == models.RoleManager || role == models.RoleSupervisor {
		for _, m := range ws.Members {
			if m == userID {
				return true
			}
		}
	}
	return false
}

func CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Name) == "" {
		http.Error(w, "Workspace name is required", http.StatusBadRequest)
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

	ws := &models.Workspace{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     userID,
		Members:     []string{userID},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	col := db.DB.Collection("workspaces")
	result, err := col.InsertOne(ctx, ws)
	if err != nil {
		http.Error(w, "Failed to create workspace", http.StatusInternalServerError)
		return
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		ws.ID = oid
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ws)
}

func ListWorkspaces(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
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

	col := db.DB.Collection("workspaces")
	cursor, err := col.Find(ctx, bson.M{
		"$or": []bson.M{
			{"ownerId": userID},
			{"members": userID},
		},
	})
	if err != nil {
		http.Error(w, "Failed to list workspaces", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	workspaces := make([]models.Workspace, 0)
	if err := cursor.All(ctx, &workspaces); err != nil {
		http.Error(w, "Failed to read workspaces", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspaces)
}

func GetWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/workspaces/")
	if id == "" || id == "/api/workspaces" {
		http.Error(w, "Workspace ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
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

	col := db.DB.Collection("workspaces")
	var ws models.Workspace
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&ws)
	if err != nil {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}

	if ws.OwnerID != userID {
		isMember := false
		for _, m := range ws.Members {
			if m == userID {
				isMember = true
				break
			}
		}
		if !isMember {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ws)
}

func UpdateWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/workspaces/")
	if id == "" || id == "/api/workspaces" {
		http.Error(w, "Workspace ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
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

	col := db.DB.Collection("workspaces")
	var ws models.Workspace
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&ws)
	if err != nil {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}

	if !isOwnerOrAuthorized(r, &ws) {
		http.Error(w, "Access denied: Not authorized to update this workspace", http.StatusForbidden)
		return
	}

	update := bson.M{"updatedAt": time.Now()}
	if req.Name != "" {
		update["name"] = req.Name
	}
	if req.Description != "" || req.Description == "" {
		update["description"] = req.Description
	}
	if req.Members != nil {
		update["members"] = req.Members
	}

	_, err = col.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	if err != nil {
		http.Error(w, "Failed to update workspace", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

func AddWorkspaceMember(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	path := r.URL.Path
	parts := strings.Split(path, "/")
	// Expected: /api/workspaces/{id}/members
	if len(parts) < 5 || parts[3] == "" || parts[4] != "members" {
		http.Error(w, "Workspace ID and /members required", http.StatusBadRequest)
		return
	}
	wsID := parts[3]

	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	col := db.DB.Collection("workspaces")
	var ws models.Workspace
	objID, err := bson.ObjectIDFromHex(wsID)
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&ws)
	if err != nil {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}

	if !isOwnerOrAuthorized(r, &ws) {
		http.Error(w, "Access denied: only owner/manager/supervisor can manage members", http.StatusForbidden)
		return
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	userCol := db.DB.Collection("users")
	var targetUser models.User
	err = userCol.FindOne(ctx, bson.M{"email": req.Email}).Decode(&targetUser)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	for _, m := range ws.Members {
		if m == targetUser.ID.Hex() {
			http.Error(w, "User already a member", http.StatusConflict)
			return
		}
	}

	_, err = col.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$addToSet": bson.M{"members": targetUser.ID.Hex()}})
	if err != nil {
		http.Error(w, "Failed to add member", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Member added",
		"workspaceId": wsID,
		"memberId":  targetUser.ID.Hex(),
		"email":     req.Email,
	})
}

func DeleteWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/workspaces/")
	if id == "" || id == "/api/workspaces" {
		http.Error(w, "Workspace ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
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

	col := db.DB.Collection("workspaces")
	var ws models.Workspace
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&ws)
	if err != nil {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}

	if ws.OwnerID != userID {
		http.Error(w, "Access denied: Only owner can delete workspace", http.StatusForbidden)
		return
	}

	_, err = col.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Failed to delete workspace", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
