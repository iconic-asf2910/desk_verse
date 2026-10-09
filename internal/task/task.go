package task

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
	return db.DB.Collection("tasks")
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
func HandleTasks(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateTask(w, r)
	case http.MethodGet:
		ListTasks(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
func HandleTaskByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetTask(w, r)
	case http.MethodPut:
		UpdateTask(w, r)
	case http.MethodDelete:
		DeleteTask(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
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
func CreateTask(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req struct {
		WorkspaceID string `json:"workspaceId"`
		Title       string `json:"title"`
		Description string `json:"description"`
		AssignedTo  string `json:"assignedTo"`
		Status      string `json:"status"`
		Priority    string `json:"priority"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.WorkspaceID == "" {
		http.Error(w, "workspaceId required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		http.Error(w, "title required", http.StatusBadRequest)
		return
	}
	if req.Status != "" && req.Status != "todo" && req.Status != "in_progress" && req.Status != "completed" {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}
	if req.Priority != "" && req.Priority != "low" && req.Priority != "medium" && req.Priority != "high" {
		http.Error(w, "invalid priority", http.StatusBadRequest)
		return
	}
	if !isUserInWorkspace(userID, req.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}
	if req.AssignedTo != "" && !isUserInWorkspace(req.AssignedTo, req.WorkspaceID) {
		http.Error(w, "assignedTo must be workspace member", http.StatusForbidden)
		return
	}
	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}
	col := collection()
	if col == nil {
		http.Error(w, "DB collection not available", http.StatusInternalServerError)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	status := req.Status
	if status == "" {
		status = "todo"
	}
	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}
	task := &models.Task{WorkspaceID: req.WorkspaceID, Title: strings.TrimSpace(req.Title), Description: strings.TrimSpace(req.Description), AssignedTo: req.AssignedTo, Status: status, Priority: priority, CreatedBy: userID, CreatedAt: time.Now(), UpdatedAt: time.Now()}
	result, err := col.InsertOne(ctx, task)
	if err != nil {
		http.Error(w, "Failed to create task", http.StatusInternalServerError)
		return
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		task.ID = oid.Hex()
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}
func ListTasks(w http.ResponseWriter, r *http.Request) {
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
	if col == nil {
		http.Error(w, "DB collection not available", http.StatusInternalServerError)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{"workspaceId": workspaceID}
	assignedTo := r.URL.Query().Get("assignedTo")
	if assignedTo != "" {
		filter["assignedTo"] = assignedTo
	}
	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.M{"createdAt": 1}))
	if err != nil {
		http.Error(w, "Failed to list tasks", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)
	var tasks []models.Task
	if err := cursor.All(ctx, &tasks); err != nil {
		http.Error(w, "Failed to read tasks", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}
func GetTask(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	id := getTaskIDFromPath(r)
	if id == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}
	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}
	col := collection()
	if col == nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var task models.Task
	err := col.FindOne(ctx, bson.M{"_id": parseObjectID(id)}).Decode(&task)
	if err == mongo.ErrNoDocuments {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&task)
	}
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}
	if !isUserInWorkspace(userID, task.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}
func UpdateTask(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	id := getTaskIDFromPath(r)
	if id == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		AssignedTo  string `json:"assignedTo"`
		Status      string `json:"status"`
		Priority    string `json:"priority"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Status != "" && req.Status != "todo" && req.Status != "in_progress" && req.Status != "completed" {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}
	if req.Priority != "" && req.Priority != "low" && req.Priority != "medium" && req.Priority != "high" {
		http.Error(w, "invalid priority", http.StatusBadRequest)
		return
	}
	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}
	col := collection()
	if col == nil {
		http.Error(w, "DB collection not available", http.StatusInternalServerError)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var task models.Task
	var objID bson.ObjectID
	objID, err := bson.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	if err != nil {
		filter = bson.M{"_id": id}
	}
	err = col.FindOne(ctx, filter).Decode(&task)
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}
	if !isUserInWorkspace(userID, task.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}
	if task.CreatedBy != userID && task.AssignedTo != userID {
		http.Error(w, "Access denied: not task creator or assignee", http.StatusForbidden)
		return
	}
	if req.AssignedTo != "" && req.AssignedTo != task.AssignedTo && !isUserInWorkspace(req.AssignedTo, task.WorkspaceID) {
		http.Error(w, "assignedTo must be workspace member", http.StatusForbidden)
		return
	}
	update := bson.M{}
	if strings.TrimSpace(req.Title) != "" {
		update["title"] = req.Title
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.AssignedTo != "" {
		update["assignedTo"] = req.AssignedTo
	}
	if req.Status != "" {
		update["status"] = req.Status
	}
	if req.Priority != "" {
		update["priority"] = req.Priority
	}
	if len(update) == 0 {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"no changes"}`))
		return
	}
	update["updatedAt"] = time.Now()
	_, err = col.UpdateOne(ctx, filter, bson.M{"$set": update})
	if err != nil {
		http.Error(w, "Failed to update task", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}
func DeleteTask(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	id := getTaskIDFromPath(r)
	if id == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}
	if db.DB == nil {
		if err := db.Connect(); err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
	}
	col := collection()
	if col == nil {
		http.Error(w, "DB collection not available", http.StatusInternalServerError)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var task models.Task
	var objID bson.ObjectID
	objID, err := bson.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	if err != nil {
		filter = bson.M{"_id": id}
	}
	err = col.FindOne(ctx, filter).Decode(&task)
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}
	if !isUserInWorkspace(userID, task.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}
	if task.CreatedBy != userID {
		http.Error(w, "Access denied: only creator can delete", http.StatusForbidden)
		return
	}
	_, err = col.DeleteOne(ctx, filter)
	if err != nil {
		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func getTaskIDFromPath(r *http.Request) string {
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
		col := db.DB.Collection("tasks")
		col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
			Keys: bson.D{{Key: "workspaceId", Value: 1}, {Key: "createdAt", Value: 1}},
		})
	}
}
