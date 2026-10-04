package room

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/iconic-asf2910/vow/internal/auth"
	"github.com/iconic-asf2910/vow/internal/db"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

func setupRoomDB(t *testing.T) func(t *testing.T) {
	t.Helper()
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_TEST_DB_NAME")
	if dbName == "" {
		dbName = "vow_test"
	}

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		t.Fatalf("failed to create mongo client: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		t.Fatalf("failed to ping mongo: %v", err)
	}

	db.Client = client
	db.DB = client.Database(dbName)

	cols := []string{"users", "workspaces", "rooms"}
	for _, c := range cols {
		db.DB.Collection(c).DeleteMany(context.Background(), bson.M{})
	}

	return func(t *testing.T) {
		t.Helper()
		for _, c := range cols {
			db.DB.Collection(c).DeleteMany(context.Background(), bson.M{})
		}
	}
}

func generateRoomToken(userID, role string) string {
	claims := auth.Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "vow-backend",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, _ := token.SignedString(auth.SecretKey)
	return s
}

func TestRoomJWT(t *testing.T) {
	cleanup := setupRoomDB(t)
	defer cleanup(t)

	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/ws1/rooms", bytes.NewReader([]byte(`{"name":"R"}`)))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "ok", http.StatusOK)
	}).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 without middleware, got %d", rr.Code)
	}

	// Missing JWT via middleware
	req2 := httptest.NewRequest(http.MethodPost, "/api/workspaces/ws1/rooms", bytes.NewReader([]byte(`{"name":"R"}`)))
	req2.Header.Set("Content-Type", "application/json")
	rr2 := httptest.NewRecorder()
	middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})(rr2, req2)
	if rr2.Code != http.StatusUnauthorized {
		t.Errorf("missing JWT expected 401, got %d", rr2.Code)
	}

	// Invalid JWT
	req3 := httptest.NewRequest(http.MethodPost, "/api/workspaces/ws1/rooms", bytes.NewReader([]byte(`{"name":"R"}`)))
	req3.Header.Set("Content-Type", "application/json")
	req3.Header.Set("Authorization", "Bearer badtoken")
	rr3 := httptest.NewRecorder()
	middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})(rr3, req3)
	if rr3.Code != http.StatusUnauthorized {
		t.Errorf("invalid JWT expected 401, got %d", rr3.Code)
	}

	// Valid JWT
	req4 := httptest.NewRequest(http.MethodPost, "/api/workspaces/ws1/rooms", bytes.NewReader([]byte(`{"name":"R"}`)))
	req4.Header.Set("Content-Type", "application/json")
	req4.Header.Set("Authorization", "Bearer "+generateRoomToken("u1", models.RoleTeamMember))
	rr4 := httptest.NewRecorder()
	middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})(rr4, req4)
	if rr4.Code != http.StatusOK {
		t.Errorf("valid JWT expected 200, got %d", rr4.Code)
	}
}

func TestCreateRoom(t *testing.T) {
	cleanup := setupRoomDB(t)
	defer cleanup(t)

	// Setup workspace with user member
	ws := models.Workspace{
		ID:      bson.NewObjectID(),
		Name:    "WS",
		OwnerID: "user1",
		Members: []string{"user1", "user2"},
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	tests := []struct {
		name       string
		auth       string
		path       string
		body       string
		expStatus  int
	}{
		{"missing JWT", "", fmt.Sprintf("/api/workspaces/%s/rooms", ws.ID.Hex()), `{"name":"R"}`, http.StatusUnauthorized},
		{"invalid JWT", "Bearer bad", fmt.Sprintf("/api/workspaces/%s/rooms", ws.ID.Hex()), `{"name":"R"}`, http.StatusUnauthorized},
		{"non-member", "Bearer " + generateRoomToken("other", models.RoleTeamMember), fmt.Sprintf("/api/workspaces/%s/rooms", ws.ID.Hex()), `{"name":"R"}`, http.StatusForbidden},
		{"missing name", "Bearer " + generateRoomToken("user1", models.RoleTeamMember), fmt.Sprintf("/api/workspaces/%s/rooms", ws.ID.Hex()), `{"type":"general"}`, http.StatusBadRequest},
		{"valid", "Bearer " + generateRoomToken("user1", models.RoleTeamMember), fmt.Sprintf("/api/workspaces/%s/rooms", ws.ID.Hex()), `{"name":"Meeting","description":"Desc","type":"general"}`, http.StatusCreated},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, tt.path, bytes.NewReader([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			if tt.auth != "" {
				req.Header.Set("Authorization", tt.auth)
			}
			rr := httptest.NewRecorder()
			middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
				HandleRooms(w, r)
			})(rr, req)
			if rr.Code != tt.expStatus {
				t.Errorf("expected %d got %d body=%s", tt.expStatus, rr.Code, rr.Body.String())
			}
		})
	}
}

func TestListRooms(t *testing.T) {
	cleanup := setupRoomDB(t)
	defer cleanup(t)

	ws := models.Workspace{
		ID:      bson.NewObjectID(),
		Name:    "W",
		OwnerID: "u1",
		Members: []string{"u1"},
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	rm := models.Room{
		ID:          bson.NewObjectID(),
		WorkspaceID: ws.ID.Hex(),
		Name:        "Room1",
		Type:        "general",
		CreatedBy:   "u1",
		Members:     []string{"u1"},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	db.DB.Collection("rooms").InsertOne(context.Background(), rm)

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/workspaces/%s/rooms", ws.ID.Hex()), nil)
	req.Header.Set("Authorization", "Bearer "+generateRoomToken("u1", models.RoleTeamMember))
	rr := httptest.NewRecorder()
	middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		HandleRooms(w, r)
	})(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 got %d", rr.Code)
	}
}

func TestGetRoom(t *testing.T) {
	cleanup := setupRoomDB(t)
	defer cleanup(t)

	ws := models.Workspace{
		ID:      bson.NewObjectID(),
		Name:    "W",
		OwnerID: "u1",
		Members: []string{"u1"},
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	rm := models.Room{
		ID:          bson.NewObjectID(),
		WorkspaceID: ws.ID.Hex(),
		Name:        "R",
		Type:        "general",
		CreatedBy:   "u1",
		Members:     []string{"u1"},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	db.DB.Collection("rooms").InsertOne(context.Background(), rm)

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), nil)
	req.Header.Set("Authorization", "Bearer "+generateRoomToken("u1", models.RoleTeamMember))
	rr := httptest.NewRecorder()
	middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		HandleRoomByID(w, r)
	})(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 got %d body=%s", rr.Code, rr.Body.String())
	}
}

func TestUpdateRoom(t *testing.T) {
	cleanup := setupRoomDB(t)
	defer cleanup(t)

	ws := models.Workspace{
		ID:      bson.NewObjectID(),
		Name:    "W",
		OwnerID: "u1",
		Members: []string{"u1", "u2"},
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	rm := models.Room{
		ID:          bson.NewObjectID(),
		WorkspaceID: ws.ID.Hex(),
		Name:        "Original",
		Description: "Original Desc",
		Type:        "general",
		CreatedBy:   "u1",
		Members:     []string{"u1"},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	db.DB.Collection("rooms").InsertOne(context.Background(), rm)

	tests := []struct {
		name      string
		auth      string
		path      string
		body      string
		expStatus int
	}{
		{"missing JWT", "", fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), `{"name":"New"}`, http.StatusUnauthorized},
		{"invalid JWT", "Bearer bad", fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), `{"name":"New"}`, http.StatusUnauthorized},
		{"invalid room id", "Bearer " + generateRoomToken("u1", models.RoleTeamMember), "/api/rooms/bad-id", `{"name":"New"}`, http.StatusBadRequest},
		{"non-member update", "Bearer " + generateRoomToken("other", models.RoleTeamMember), fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), `{"name":"New"}`, http.StatusForbidden},
		{"update name", "Bearer " + generateRoomToken("u1", models.RoleTeamMember), fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), `{"name":"Updated"}`, http.StatusOK},
		{"update desc preserved when omitted", "Bearer " + generateRoomToken("u1", models.RoleTeamMember), fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), `{"name":"Updated"}`, http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, tt.path, bytes.NewReader([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			if tt.auth != "" {
				req.Header.Set("Authorization", tt.auth)
			}
			rr := httptest.NewRecorder()
			middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
				HandleRoomByID(w, r)
			})(rr, req)
			if rr.Code != tt.expStatus {
				t.Errorf("expected %d got %d body=%s", tt.expStatus, rr.Code, rr.Body.String())
			}
		})
	}

	// Verify description preserved when omitted
	req3 := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), bytes.NewReader([]byte(`{"name":"Updated Only"}`)))
	req3.Header.Set("Content-Type", "application/json")
	req3.Header.Set("Authorization", "Bearer "+generateRoomToken("u1", models.RoleTeamMember))
	rr3 := httptest.NewRecorder()
	middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		HandleRoomByID(w, r)
	})(rr3, req3)
	if rr3.Code != http.StatusOK {
		t.Errorf("update expected 200 got %d", rr3.Code)
	}

	var updated models.Room
	db.DB.Collection("rooms").FindOne(context.Background(), bson.M{"_id": rm.ID}).Decode(&updated)
	if updated.Description != "Original Desc" {
		t.Errorf("description erased: expected %q got %q", "Original Desc", updated.Description)
	}
}

func TestDeleteRoom(t *testing.T) {
	cleanup := setupRoomDB(t)
	defer cleanup(t)

	ws := models.Workspace{
		ID:      bson.NewObjectID(),
		Name:    "W",
		OwnerID: "u1",
		Members: []string{"u1", "u2"},
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	rm := models.Room{
		ID:          bson.NewObjectID(),
		WorkspaceID: ws.ID.Hex(),
		Name:        "ToDelete",
		Type:        "general",
		CreatedBy:   "u1",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	db.DB.Collection("rooms").InsertOne(context.Background(), rm)

	tests := []struct {
		name      string
		auth      string
		path      string
		expStatus int
	}{
		{"missing JWT", "", fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), http.StatusUnauthorized},
		{"invalid JWT", "Bearer bad", fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), http.StatusUnauthorized},
		{"invalid id", "Bearer " + generateRoomToken("u1", models.RoleTeamMember), "/api/rooms/bad", http.StatusBadRequest},
		{"non-owner member", "Bearer " + generateRoomToken("u2", models.RoleTeamMember), fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), http.StatusForbidden},
		{"other non-member", "Bearer " + generateRoomToken("other", models.RoleTeamMember), fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), http.StatusForbidden},
		{"owner delete", "Bearer " + generateRoomToken("u1", models.RoleTeamMember), fmt.Sprintf("/api/rooms/%s", rm.ID.Hex()), http.StatusNoContent},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, tt.path, nil)
			if tt.auth != "" {
				req.Header.Set("Authorization", tt.auth)
			}
			rr := httptest.NewRecorder()
			middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
				HandleRoomByID(w, r)
			})(rr, req)
			if rr.Code != tt.expStatus {
				t.Errorf("expected %d got %d body=%s", tt.expStatus, rr.Code, rr.Body.String())
			}
		})
	}
}
