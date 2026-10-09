package poll

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
	return db.DB.Collection("polls")
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

// HandlePolls handles POST /api/polls and GET /api/polls?workspaceId=...
func HandlePolls(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreatePoll(w, r)
	case http.MethodGet:
		ListPolls(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// HandlePollByID handles GET /api/polls/{id}, PUT /api/polls/{id}/close
func HandlePollByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetPoll(w, r)
	case http.MethodPut:
		HandlePollClose(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// HandlePollVote handles POST /api/polls/{id}/vote
func HandlePollVote(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		VoteOnPoll(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func CreatePoll(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		WorkspaceID   string   `json:"workspaceId"`
		Question      string   `json:"question"`
		Options       []string `json:"options"`
		EligibleUsers []string `json:"eligibleUsers"`
		ExpiresAt     string   `json:"expiresAt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.WorkspaceID == "" {
		http.Error(w, "workspaceId required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Question) == "" {
		http.Error(w, "question required", http.StatusBadRequest)
		return
	}
	if len(req.Options) < 2 {
		http.Error(w, "at least 2 options required", http.StatusBadRequest)
		return
	}
	for i, opt := range req.Options {
		if strings.TrimSpace(opt) == "" {
			http.Error(w, "option cannot be empty", http.StatusBadRequest)
			return
		}
		req.Options[i] = strings.TrimSpace(opt)
	}

	if !isUserInWorkspace(userID, req.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	if len(req.EligibleUsers) > 0 {
		for _, uid := range req.EligibleUsers {
			if !isUserInWorkspace(uid, req.WorkspaceID) {
				http.Error(w, "eligibleUsers must be workspace members", http.StatusForbidden)
				return
			}
		}
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

	expiresAt := time.Time{}
	if req.ExpiresAt != "" {
		var err error
		expiresAt, err = time.Parse(time.RFC3339, req.ExpiresAt)
		if err != nil {
			http.Error(w, "invalid expiresAt format, use RFC3339", http.StatusBadRequest)
			return
		}
		if !expiresAt.IsZero() && expiresAt.Before(time.Now()) {
			http.Error(w, "expiresAt must be in the future", http.StatusBadRequest)
			return
		}
	}

	poll := &models.Poll{
		WorkspaceID:   req.WorkspaceID,
		Question:      strings.TrimSpace(req.Question),
		Options:       req.Options,
		CreatedBy:     userID,
		EligibleUsers: req.EligibleUsers,
		Status:        "open",
		CreatedAt:     time.Now(),
		ExpiresAt:     expiresAt,
	}

	result, err := col.InsertOne(ctx, poll)
	if err != nil {
		http.Error(w, "Failed to create poll", http.StatusInternalServerError)
		return
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		poll.ID = oid.Hex()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(poll)
}

func ListPolls(w http.ResponseWriter, r *http.Request) {
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
	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.M{"createdAt": 1}))
	if err != nil {
		http.Error(w, "Failed to list polls", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		http.Error(w, "Failed to read polls", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(polls)
}

func GetPoll(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getPollIDFromPath(r)
	if id == "" {
		http.Error(w, "Poll ID required", http.StatusBadRequest)
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

	var poll models.Poll
	err := col.FindOne(ctx, bson.M{"_id": parseObjectID(id)}).Decode(&poll)
	if err == mongo.ErrNoDocuments {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	}
	if err != nil {
		http.Error(w, "Poll not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, poll.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(poll)
}

func VoteOnPoll(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getPollIDFromPath(r)
	if id == "" {
		http.Error(w, "Poll ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Option string `json:"option"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Option) == "" {
		http.Error(w, "option required", http.StatusBadRequest)
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

	var poll models.Poll
	filter := bson.M{"_id": parseObjectID(id)}
	err := col.FindOne(ctx, filter).Decode(&poll)
	if err == mongo.ErrNoDocuments {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	}
	if err != nil {
		http.Error(w, "Poll not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, poll.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	// Check if poll is open and not expired
	if poll.Status != "open" {
		http.Error(w, "Poll is closed", http.StatusBadRequest)
		return
	}
	if !poll.ExpiresAt.IsZero() && time.Now().After(poll.ExpiresAt) {
		http.Error(w, "Poll has expired", http.StatusBadRequest)
		return
	}

	// Check if option is valid
	optionValid := false
	for _, opt := range poll.Options {
		if opt == req.Option {
			optionValid = true
			break
		}
	}
	if !optionValid {
		http.Error(w, "Invalid option", http.StatusBadRequest)
		return
	}

	// Check for eligibleUsers restriction
	if len(poll.EligibleUsers) > 0 {
		eligible := false
		for _, uid := range poll.EligibleUsers {
			if uid == userID {
				eligible = true
				break
			}
		}
		if !eligible {
			http.Error(w, "You are not eligible to vote on this poll", http.StatusForbidden)
			return
		}
	}

	// Check for duplicate vote
	for _, v := range poll.Votes {
		if v.UserID == userID {
			http.Error(w, "You have already voted on this poll", http.StatusBadRequest)
			return
		}
	}

	// Add the vote
	newVote := models.Vote{
		UserID:  userID,
		Option:  req.Option,
		VotedAt: time.Now(),
	}
	poll.Votes = append(poll.Votes, newVote)

	// Update the poll
	_, err = col.UpdateOne(ctx, filter, bson.M{"$push": bson.M{"votes": newVote}})
	if err != nil {
		http.Error(w, "Failed to record vote", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(poll)
}

func HandlePollClose(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := getPollIDFromPath(r)
	if id == "" {
		http.Error(w, "Poll ID required", http.StatusBadRequest)
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

	var poll models.Poll
	filter := bson.M{"_id": parseObjectID(id)}
	err := col.FindOne(ctx, filter).Decode(&poll)
	if err == mongo.ErrNoDocuments {
		err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	}
	if err != nil {
		http.Error(w, "Poll not found", http.StatusNotFound)
		return
	}

	if !isUserInWorkspace(userID, poll.WorkspaceID) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	if poll.CreatedBy != userID {
		http.Error(w, "Only the poll creator can close this poll", http.StatusForbidden)
		return
	}

	if poll.Status == "closed" {
		http.Error(w, "Poll is already closed", http.StatusBadRequest)
		return
	}

	_, err = col.UpdateOne(ctx, filter, bson.M{"$set": bson.M{"status": "closed"}})
	if err != nil {
		http.Error(w, "Failed to close poll", http.StatusInternalServerError)
		return
	}

	poll.Status = "closed"
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(poll)
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

func getPollIDFromPath(r *http.Request) string {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) >= 2 {
		last := parts[len(parts)-1]
		if last == "close" && len(parts) >= 3 {
			return parts[len(parts)-2]
		}
		return last
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
		col := db.DB.Collection("polls")
		col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
			Keys: bson.D{{Key: "workspaceId", Value: 1}, {Key: "createdAt", Value: 1}},
		})
	}
}
