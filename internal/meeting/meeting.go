package meeting

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func HandleMeetings(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateMeeting(w, r)
	case http.MethodGet:
		ListMeetings(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func HandleMeetingByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetMeeting(w, r)
	case http.MethodPut:
		UpdateMeeting(w, r)
	case http.MethodDelete:
		DeleteMeeting(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func collection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("meetings")
}

func workspaceCollection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("workspaces")
}

func roomCollection() *mongo.Collection {
	if db.DB == nil {
		return nil
	}
	return db.DB.Collection("rooms")
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

func getMeetingIDFromPath(r *http.Request) string {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) >= 2 {
		return parts[len(parts)-1]
	}
	return ""
}

func IsUserAuthorizedForMeeting(m *models.Meeting, userID string) bool {
	if m == nil || userID == "" {
		return false
	}
	return isUserInWorkspace(userID, m.WorkspaceID)
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
	col := roomCollection()
	if col == nil {
		return false
	}
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

func generateMeetingCode() (string, error) {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return strings.ToUpper(hex.EncodeToString(bytes)), nil
}

func generateMeetingLink(meetingCode string) string {
	return fmt.Sprintf("https://vow.app/meeting/%s", meetingCode)
}

func CreateMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		WorkspaceID  string    `json:"workspaceId"`
		RoomID       string    `json:"roomId"`
		Title        string    `json:"title"`
		Description  string    `json:"description"`
		Participants []string  `json:"participants"`
		StartTime    time.Time `json:"startTime"`
		EndTime      time.Time `json:"endTime"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.WorkspaceID) == "" {
		http.Error(w, "workspaceId is required", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.RoomID) == "" {
		http.Error(w, "roomId is required", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Title) == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}

	if req.StartTime.IsZero() {
		http.Error(w, "startTime is required", http.StatusBadRequest)
		return
	}

	if req.EndTime.IsZero() {
		http.Error(w, "endTime is required", http.StatusBadRequest)
		return
	}

	if req.EndTime.Before(req.StartTime) {
		http.Error(w, "endTime must be after startTime", http.StatusBadRequest)
		return
	}

	if !isUserInWorkspace(userID, req.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	if !roomExists(req.RoomID, req.WorkspaceID) {
		http.Error(w, "Room not found in workspace", http.StatusNotFound)
		return
	}

	meetingCode, err := generateMeetingCode()
	if err != nil {
		http.Error(w, "Failed to generate meeting code", http.StatusInternalServerError)
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

	participants := req.Participants
	if participants == nil {
		participants = []string{}
	}

	meeting := &models.Meeting{
		WorkspaceID:  req.WorkspaceID,
		RoomID:       req.RoomID,
		Title:        req.Title,
		Description:  req.Description,
		CreatedBy:    userID,
		Participants: participants,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		MeetingCode:  meetingCode,
		MeetingLink:  generateMeetingLink(meetingCode),
		Status:       "scheduled",
		CreatedAt:    time.Now(),
	}

	col := collection()
	result, err := col.InsertOne(ctx, meeting)
	if err != nil {
		http.Error(w, "Failed to create meeting", http.StatusInternalServerError)
		return
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		meeting.ID = oid
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(meeting)
}

func ListMeetings(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.URL.Query().Get("workspaceId")
	if workspaceID == "" {
		http.Error(w, "workspaceId query parameter required", http.StatusBadRequest)
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
		http.Error(w, "Failed to list meetings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var meetings []models.Meeting
	if err := cursor.All(ctx, &meetings); err != nil {
		http.Error(w, "Failed to read meetings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meetings)
}

func GetMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMeetingIDFromPath(r)
	if id == "" {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
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
	var meeting models.Meeting
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&meeting)
	if err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, meeting.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meeting)
}

func UpdateMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMeetingIDFromPath(r)
	if id == "" {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Title        string    `json:"title"`
		Description  string    `json:"description"`
		Participants []string  `json:"participants"`
		StartTime    time.Time `json:"startTime"`
		EndTime      time.Time `json:"endTime"`
		Status       string    `json:"status"`
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
	var meeting models.Meeting
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&meeting)
	if err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, meeting.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	update := bson.M{}

	if strings.TrimSpace(req.Title) != "" {
		update["title"] = req.Title
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.Participants != nil {
		update["participants"] = req.Participants
	}
	if !req.StartTime.IsZero() {
		update["startTime"] = req.StartTime
	}
	if !req.EndTime.IsZero() {
		update["endTime"] = req.EndTime
	}
	if req.StartTime.IsZero() && req.EndTime.IsZero() {
	} else if !req.StartTime.IsZero() && !req.EndTime.IsZero() {
		if req.EndTime.Before(req.StartTime) {
			http.Error(w, "endTime must be after startTime", http.StatusBadRequest)
			return
		}
	}

	validStatuses := map[string]bool{
		"scheduled": true,
		"active":    true,
		"completed": true,
		"cancelled": true,
	}
	if req.Status != "" {
		if !validStatuses[req.Status] {
			http.Error(w, "Invalid status. Must be: scheduled, active, completed, or cancelled", http.StatusBadRequest)
			return
		}
		update["status"] = req.Status
	}

	if len(update) == 0 {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"no changes"}`))
		return
	}

	_, err = col.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	if err != nil {
		http.Error(w, "Failed to update meeting", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

func DeleteMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMeetingIDFromPath(r)
	if id == "" {
		http.Error(w, "Meeting ID required", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
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
	var meeting models.Meeting
	err = col.FindOne(ctx, bson.M{"_id": objID}).Decode(&meeting)
	if err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, meeting.WorkspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	if meeting.CreatedBy != userID {
		http.Error(w, "Access denied: Only creator can delete meeting", http.StatusForbidden)
		return
	}

	_, err = col.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Failed to delete meeting", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
