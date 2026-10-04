package workspace_test

import (
	"bytes"
	"context"
	"encoding/json"
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
	"github.com/iconic-asf2910/vow/internal/workspace"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

func setupTestDB() error {
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_TEST_DB_NAME")
	if dbName == "" {
		dbName = "vow_test"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return fmt.Errorf("failed to create MongoDB client: %v", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	db.Client = client
	db.DB = client.Database(dbName)
	return nil
}

func generateTestToken(userID, role string) string {
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
	tokenString, _ := token.SignedString(auth.SecretKey)
	return tokenString
}

func setupWorkspaceTest(t *testing.T) func(t *testing.T) {
	t.Helper()

	if err := setupTestDB(); err != nil {
		t.Fatalf("Failed to setup test DB: %v", err)
	}

	collections := []string{"users", "workspaces"}
	for _, colName := range collections {
		collection := db.DB.Collection(colName)
		if _, err := collection.DeleteMany(context.Background(), bson.M{}); err != nil {
			t.Fatalf("Failed to clear collection %s: %v", colName, err)
		}
	}

	return func(t *testing.T) {
		t.Helper()
		for _, colName := range collections {
			collection := db.DB.Collection(colName)
			collection.DeleteMany(context.Background(), bson.M{})
		}
	}
}

func TestCreateWorkspace(t *testing.T) {
	cleanup := setupWorkspaceTest(t)
	defer cleanup(t)

	tests := []struct {
		name           string
		authHeader     string
		requestBody    map[string]string
		expectedStatus int
		checkOwner     string
	}{
		{
			name:           "Missing JWT",
			authHeader:     "",
			requestBody:    map[string]string{"name": "Test Workspace"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid JWT",
			authHeader:     "Bearer invalid-token",
			requestBody:    map[string]string{"name": "Test Workspace"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Empty Workspace Name",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("user123", models.RoleTeamMember)),
			requestBody:    map[string]string{"name": ""},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Whitespace Only Name",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("user123", models.RoleTeamMember)),
			requestBody:    map[string]string{"name": "   "},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Valid Create - Team Member",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("user1", models.RoleTeamMember)),
			requestBody:    map[string]string{"name": "Team Workspace", "description": "Test"},
			expectedStatus: http.StatusCreated,
			checkOwner:     "user1",
		},
		{
			name:           "Valid Create - Manager",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("user2", models.RoleManager)),
			requestBody:    map[string]string{"name": "Manager Workspace"},
			expectedStatus: http.StatusCreated,
			checkOwner:     "user2",
		},
		{
			name:           "Valid Create - Supervisor",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("user3", models.RoleSupervisor)),
			requestBody:    map[string]string{"name": "Supervisor Workspace"},
			expectedStatus: http.StatusCreated,
			checkOwner:     "user3",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reqBody, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/api/workspaces", bytes.NewReader(reqBody))
			req.Header.Set("Content-Type", "application/json")
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			middleware.RequireAuth(workspace.HandleWorkspaces)(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. Body: %s", tt.expectedStatus, rr.Code, rr.Body.String())
			}

			if tt.expectedStatus == http.StatusCreated {
				var response models.Workspace
				json.Unmarshal(rr.Body.Bytes(), &response)

				if response.OwnerID != tt.checkOwner {
					t.Errorf("expected ownerId %s, got %s", tt.checkOwner, response.OwnerID)
				}

				if len(response.Members) != 1 || response.Members[0] != tt.checkOwner {
					t.Errorf("owner should be in members list")
				}
			}
		})
	}
}

func TestListWorkspaces(t *testing.T) {
	cleanup := setupWorkspaceTest(t)
	defer cleanup(t)

	user1ID := "user1"
	user2ID := "user2"

	ws1 := models.Workspace{
		ID:        bson.NewObjectID(),
		Name:      "User1 Workspace",
		OwnerID:   user1ID,
		Members:   []string{user1ID},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws1)

	ws2 := models.Workspace{
		ID:        bson.NewObjectID(),
		Name:      "User2 Workspace",
		OwnerID:   user2ID,
		Members:   []string{user2ID},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws2)

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
		expectedCount  int
	}{
		{
			name:           "Missing JWT",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid JWT",
			authHeader:     "Bearer invalid",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "User1 Lists Workspaces",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(user1ID, models.RoleTeamMember)),
			expectedStatus: http.StatusOK,
			expectedCount:  1,
		},
		{
			name:           "User2 Lists Workspaces",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(user2ID, models.RoleManager)),
			expectedStatus: http.StatusOK,
			expectedCount:  1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/workspaces", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			middleware.RequireAuth(workspace.HandleWorkspaces)(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}

			if tt.expectedStatus == http.StatusOK {
				var response []models.Workspace
				json.Unmarshal(rr.Body.Bytes(), &response)
				if len(response) != tt.expectedCount {
					t.Errorf("expected %d workspaces, got %d", tt.expectedCount, len(response))
				}
			}
		})
	}
}

func TestGetWorkspace(t *testing.T) {
	cleanup := setupWorkspaceTest(t)
	defer cleanup(t)

	ownerID := "owner1"
	memberID := "member1"
	nonMemberID := "nonmember1"

	ws := models.Workspace{
		ID:        bson.NewObjectID(),
		Name:      "Test Workspace",
		OwnerID:   ownerID,
		Members:   []string{ownerID, memberID},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	tests := []struct {
		name           string
		authHeader     string
		workspaceID    string
		expectedStatus int
	}{
		{
			name:           "Missing JWT",
			authHeader:     "",
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid JWT",
			authHeader:     "Bearer invalid",
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Workspace ID",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    "invalid-id",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Non-existent Workspace",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    bson.NewObjectID().Hex(),
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "Owner Access",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Member Access",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(memberID, models.RoleTeamMember)),
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Non-Member Access Denied",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(nonMemberID, models.RoleManager)),
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/workspaces/%s", tt.workspaceID), nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			middleware.RequireAuth(workspace.HandleWorkspaceByID)(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. Body: %s", tt.expectedStatus, rr.Code, rr.Body.String())
			}
		})
	}
}

func TestUpdateWorkspace(t *testing.T) {
	cleanup := setupWorkspaceTest(t)
	defer cleanup(t)

	ownerID := "owner1"
	managerID := "manager1"
	supervisorID := "supervisor1"
	nonMemberID := "nonmember1"

	ws1 := models.Workspace{
		ID:          bson.NewObjectID(),
		Name:        "Original Name",
		Description: "Original Desc",
		OwnerID:     ownerID,
		Members:     []string{ownerID, managerID, supervisorID},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws1)

	ws2 := models.Workspace{
		ID:        bson.NewObjectID(),
		Name:      "Other Workspace",
		OwnerID:   nonMemberID,
		Members:   []string{nonMemberID},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws2)

	tests := []struct {
		name           string
		authHeader     string
		workspaceID    string
		requestBody    map[string]interface{}
		expectedStatus int
	}{
		{
			name:           "Missing JWT",
			authHeader:     "",
			workspaceID:    ws1.ID.Hex(),
			requestBody:    map[string]interface{}{"name": "Updated"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid JWT",
			authHeader:     "Bearer invalid",
			workspaceID:    ws1.ID.Hex(),
			requestBody:    map[string]interface{}{"name": "Updated"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Workspace ID",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    "invalid-id",
			requestBody:    map[string]interface{}{"name": "Updated"},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Non-existent Workspace",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    bson.NewObjectID().Hex(),
			requestBody:    map[string]interface{}{"name": "Updated"},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "Owner Can Update",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    ws1.ID.Hex(),
			requestBody:    map[string]interface{}{"name": "Owner Updated"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Manager Member Can Update",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(managerID, models.RoleManager)),
			workspaceID:    ws1.ID.Hex(),
			requestBody:    map[string]interface{}{"name": "Manager Updated"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Supervisor Member Can Update",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(supervisorID, models.RoleSupervisor)),
			workspaceID:    ws1.ID.Hex(),
			requestBody:    map[string]interface{}{"name": "Supervisor Updated"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Non-Member Cannot Update",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(nonMemberID, models.RoleManager)),
			workspaceID:    ws1.ID.Hex(),
			requestBody:    map[string]interface{}{"name": "Unauthorized Update"},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reqBody, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/api/workspaces/%s", tt.workspaceID), bytes.NewReader(reqBody))
			req.Header.Set("Content-Type", "application/json")
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			middleware.RequireAuth(workspace.HandleWorkspaceByID)(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. Body: %s", tt.expectedStatus, rr.Code, rr.Body.String())
			}
		})
	}
}

func TestDeleteWorkspace(t *testing.T) {
	cleanup := setupWorkspaceTest(t)
	defer cleanup(t)

	ownerID := "owner1"
	memberID := "member1"
	nonMemberID := "nonmember1"

	ws := models.Workspace{
		ID:        bson.NewObjectID(),
		Name:      "To Delete",
		OwnerID:   ownerID,
		Members:   []string{ownerID, memberID},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.DB.Collection("workspaces").InsertOne(context.Background(), ws)

	tests := []struct {
		name           string
		authHeader     string
		workspaceID    string
		expectedStatus int
	}{
		{
			name:           "Missing JWT",
			authHeader:     "",
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid JWT",
			authHeader:     "Bearer invalid",
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Workspace ID",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    "invalid-id",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Non-existent Workspace",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    bson.NewObjectID().Hex(),
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "Member Cannot Delete",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(memberID, models.RoleManager)),
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Non-Member Cannot Delete",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(nonMemberID, models.RoleManager)),
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Owner Can Delete",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken(ownerID, models.RoleTeamMember)),
			workspaceID:    ws.ID.Hex(),
			expectedStatus: http.StatusNoContent,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/workspaces/%s", tt.workspaceID), nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			middleware.RequireAuth(workspace.HandleWorkspaceByID)(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. Body: %s", tt.expectedStatus, rr.Code, rr.Body.String())
			}
		})
	}
}
