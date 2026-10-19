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
	id, ok := val.(string)
	if !ok {
		return ""
	}
	return id
}

func getMeetingIDFromPath(r *http.Request) string {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		return ""
	}
	return parts[2]
}

func IsUserAuthorizedForMeeting(m *models.Meeting, userID string) bool {
	if m == nil || userID == "" {
		return false
	}
	if isUserInWorkspace(userID, m.WorkspaceID) {
		return true
	}
	for _, request := range m.JoinRequests {
		if request.UserID == userID && request.Status == "approved" {
			return true
		}
	}
	return false
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
	filter := bson.M{"_id": workspaceID}
	if err == nil {
		filter = bson.M{"_id": objID}
	}

	var ws models.Workspace
	if err := col.FindOne(ctx, filter).Decode(&ws); err != nil {
		return false
	}

	for _, member := range ws.Members {
		if member == userID {
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

	roomObjectID, err := bson.ObjectIDFromHex(roomID)
	workspaceObjectID, workspaceErr := bson.ObjectIDFromHex(workspaceID)

	filter := bson.M{"_id": roomID, "workspaceId": workspaceID}
	if err == nil {
		filter["_id"] = roomObjectID
	}
	if workspaceErr == nil {
		filter["workspaceId"] = workspaceObjectID
	}

	var room models.Room
	return col.FindOne(ctx, filter).Decode(&room) == nil
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

func ensureDatabase(w http.ResponseWriter) bool {
	if db.DB != nil {
		return true
	}
	if err := db.Connect(); err != nil {
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return false
	}
	return db.DB != nil
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

	if strings.TrimSpace(req.WorkspaceID) == "" ||
		strings.TrimSpace(req.RoomID) == "" ||
		strings.TrimSpace(req.Title) == "" {
		http.Error(w, "workspaceId, roomId, and title are required", http.StatusBadRequest)
		return
	}

	if req.StartTime.IsZero() || req.EndTime.IsZero() || req.EndTime.Before(req.StartTime) {
		http.Error(w, "Valid startTime and endTime are required", http.StatusBadRequest)
		return
	}

	if !ensureDatabase(w) {
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

	code, err := generateMeetingCode()
	if err != nil {
		http.Error(w, "Failed to generate meeting code", http.StatusInternalServerError)
		return
	}

	participants := req.Participants
	if participants == nil {
		participants = []string{}
	}

	mtg := &models.Meeting{
		WorkspaceID:  req.WorkspaceID,
		RoomID:       req.RoomID,
		Title:        strings.TrimSpace(req.Title),
		Description:  req.Description,
		CreatedBy:    userID,
		Participants: participants,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		MeetingCode:  code,
		MeetingLink:  generateMeetingLink(code),
		Status:       "scheduled",
		CreatedAt:    time.Now().UTC(),
		JoinRequests: []models.MeetingJoinRequest{},
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := collection().InsertOne(ctx, mtg)
	if err != nil {
		http.Error(w, "Failed to create meeting", http.StatusInternalServerError)
		return
	}

	if id, ok := result.InsertedID.(bson.ObjectID); ok {
		mtg.ID = id
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(mtg)
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

	if !ensureDatabase(w) {
		return
	}
	if !isUserInWorkspace(userID, workspaceID) {
		http.Error(w, "Access denied: not a member of workspace", http.StatusForbidden)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	cursor, err := collection().Find(ctx, bson.M{"workspaceId": workspaceID})
	if err != nil {
		http.Error(w, "Failed to list meetings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	meetings := []models.Meeting{}
	if err := cursor.All(ctx, &meetings); err != nil {
		http.Error(w, "Failed to read meetings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(meetings)
}

func GetMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getMeetingIDFromPath(r)
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
		return
	}

	if !ensureDatabase(w) {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var mtg models.Meeting
	if err := collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&mtg); err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if !IsUserAuthorizedForMeeting(&mtg, userID) && mtg.CreatedBy != userID {
		http.Error(w, "Access denied: request approval to join this meeting", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(mtg)
}

func UpdateMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	objID, err := bson.ObjectIDFromHex(getMeetingIDFromPath(r))
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

	if !ensureDatabase(w) {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var mtg models.Meeting
	if err := collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&mtg); err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if mtg.CreatedBy != userID {
		http.Error(w, "Only the meeting creator can update it", http.StatusForbidden)
		return
	}

	update := bson.M{}
	if strings.TrimSpace(req.Title) != "" {
		update["title"] = strings.TrimSpace(req.Title)
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

	start := mtg.StartTime
	end := mtg.EndTime
	if !req.StartTime.IsZero() {
		start = req.StartTime
	}
	if !req.EndTime.IsZero() {
		end = req.EndTime
	}
	if end.Before(start) {
		http.Error(w, "endTime must be after startTime", http.StatusBadRequest)
		return
	}

	validStatuses := map[string]bool{
		"scheduled": true,
		"active":    true,
		"completed": true,
		"cancelled": true,
	}
	if req.Status != "" {
		if !validStatuses[req.Status] {
			http.Error(w, "Invalid meeting status", http.StatusBadRequest)
			return
		}
		update["status"] = req.Status
	}

	if len(update) == 0 {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"no changes"}`))
		return
	}

	if _, err := collection().UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update}); err != nil {
		http.Error(w, "Failed to update meeting", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"updated"}`))
}

func DeleteMeeting(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	objID, err := bson.ObjectIDFromHex(getMeetingIDFromPath(r))
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
		return
	}

	if !ensureDatabase(w) {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var mtg models.Meeting
	if err := collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&mtg); err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if mtg.CreatedBy != userID {
		http.Error(w, "Only the meeting creator can delete it", http.StatusForbidden)
		return
	}

	if _, err := collection().DeleteOne(ctx, bson.M{"_id": objID}); err != nil {
		http.Error(w, "Failed to delete meeting", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func HandleMeetingJoinRequests(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[0] != "api" || parts[1] != "meetings" || parts[3] != "join-requests" {
		http.Error(w, "Invalid meeting request path", http.StatusBadRequest)
		return
	}

	objID, err := bson.ObjectIDFromHex(parts[2])
	if err != nil {
		http.Error(w, "Invalid meeting ID", http.StatusBadRequest)
		return
	}

	if !ensureDatabase(w) {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	col := collection()
	var mtg models.Meeting
	if err := col.FindOne(ctx, bson.M{"_id": objID}).Decode(&mtg); err != nil {
		http.Error(w, "Meeting not found", http.StatusNotFound)
		return
	}

	if len(parts) == 4 {
		switch r.Method {
		case http.MethodPost:
			if isUserInWorkspace(userID, mtg.WorkspaceID) {
				http.Error(w, "Workspace members do not need approval", http.StatusConflict)
				return
			}

			request := models.MeetingJoinRequest{
				UserID:      userID,
				Status:      "pending",
				RequestedAt: time.Now().UTC(),
			}

			filter := bson.M{
				"_id": objID,
				"joinRequests": bson.M{
					"$not": bson.M{
						"$elemMatch": bson.M{
							"userId": userID,
							"status": bson.M{"$in": []string{"pending", "approved"}},
						},
					},
				},
			}

			result, err := col.UpdateOne(ctx, filter, bson.M{
				"$push": bson.M{"joinRequests": request},
			})
			if err != nil {
				http.Error(w, "Could not save join request", http.StatusInternalServerError)
				return
			}
			if result.MatchedCount == 0 {
				http.Error(w, "A pending or approved request already exists", http.StatusConflict)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			_ = json.NewEncoder(w).Encode(request)

		case http.MethodGet:
			if mtg.CreatedBy != userID {
				http.Error(w, "Only the meeting creator can view requests", http.StatusForbidden)
				return
			}
			requests := mtg.JoinRequests
			if requests == nil {
				requests = []models.MeetingJoinRequest{}
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(requests)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		return
	}

	if len(parts) != 6 || r.Method != http.MethodPost {
		http.Error(w, "Invalid request path or method", http.StatusBadRequest)
		return
	}

	requesterID := parts[4]
	var status string
	switch parts[5] {
	case "approve":
		status = "approved"
	case "reject":
		status = "rejected"
	default:
		http.Error(w, "Unknown action", http.StatusBadRequest)
		return
	}

	if mtg.CreatedBy != userID {
		http.Error(w, "Only the meeting creator can decide requests", http.StatusForbidden)
		return
	}
	if requesterID == "" || requesterID == userID {
		http.Error(w, "Invalid requester", http.StatusBadRequest)
		return
	}

	filter := bson.M{
		"_id": objID,
		"joinRequests": bson.M{
			"$elemMatch": bson.M{
				"userId": requesterID,
				"status": "pending",
			},
		},
	}

	result, err := col.UpdateOne(ctx, filter, bson.M{
		"$set": bson.M{"joinRequests.$.status": status},
	})
	if err != nil {
		http.Error(w, "Could not update join request", http.StatusInternalServerError)
		return
	}
	if result.MatchedCount == 0 {
		http.Error(w, "Pending request not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"userId": requesterID,
		"status": status,
	})
}
