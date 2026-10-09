package analytics

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
	return db.DB.Collection("analytics")
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

func HandleAnalytics(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		CreateAnalytics(w, r)
	case http.MethodGet:
		ListAnalytics(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func CreateAnalytics(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		WorkspaceID string  `json:"workspaceId"`
		Metric      string  `json:"metric"`
		Value       float64 `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.WorkspaceID == "" {
		http.Error(w, "workspaceId required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Metric) == "" {
		http.Error(w, "metric required", http.StatusBadRequest)
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

	analytics := &models.Analytics{
		WorkspaceID: req.WorkspaceID,
		Metric:      strings.TrimSpace(req.Metric),
		Value:       req.Value,
		Timestamp:   time.Now(),
	}

	result, err := col.InsertOne(ctx, analytics)
	if err != nil {
		http.Error(w, "Failed to create analytics", http.StatusInternalServerError)
		return
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		analytics.ID = oid.Hex()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(analytics)
}

func ListAnalytics(w http.ResponseWriter, r *http.Request) {
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
	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.M{"timestamp": -1}))
	if err != nil {
		http.Error(w, "Failed to list analytics", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var analytics []models.Analytics
	if err := cursor.All(ctx, &analytics); err != nil {
		http.Error(w, "Failed to read analytics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
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
		col := db.DB.Collection("analytics")
		col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
			Keys: bson.D{{Key: "workspaceId", Value: 1}, {Key: "timestamp", Value: -1}},
		})
	}
}
