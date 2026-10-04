package middleware_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/iconic-asf2910/vow/internal/auth"
	"github.com/iconic-asf2910/vow/internal/middleware"
	"github.com/iconic-asf2910/vow/internal/models"
)

func dummyHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
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

func TestRequireRole(t *testing.T) {
	tests := []struct {
		name           string
		roleInContext  any
		allowedRoles   []string
		expectedStatus int
	}{
		{
			name:           "Allowed Role - Manager",
			roleInContext:  models.RoleManager,
			allowedRoles:   []string{models.RoleManager},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Allowed Role - Multiple Roles",
			roleInContext:  models.RoleSupervisor,
			allowedRoles:   []string{models.RoleManager, models.RoleSupervisor},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Disallowed Role - Team Member when Manager required",
			roleInContext:  models.RoleTeamMember,
			allowedRoles:   []string{models.RoleManager},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Missing Role in Context",
			roleInContext:  nil,
			allowedRoles:   []string{models.RoleManager},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Empty String Role in Context",
			roleInContext:  "",
			allowedRoles:   []string{models.RoleManager},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)

			if tt.roleInContext != nil {
				ctx := context.WithValue(req.Context(), middleware.RoleKey, tt.roleInContext)
				req = req.WithContext(ctx)
			}

			rr := httptest.NewRecorder()

			handler := middleware.RequireRole(tt.allowedRoles...)(dummyHandler)
			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}

func TestFullAuthAndRoleChaining(t *testing.T) {
	// Protected route for managers only
	protectedHandler := middleware.RequireAuth(middleware.RequireRole(models.RoleManager)(dummyHandler))

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
	}{
		{
			name:           "No Auth Header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Token",
			authHeader:     "Bearer invalid-token",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Authenticated as Team Member (Forbidden)",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("123", models.RoleTeamMember)),
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Authenticated as Manager (Allowed)",
			authHeader:     fmt.Sprintf("Bearer %s", generateTestToken("123", models.RoleManager)),
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/test/manager", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			protectedHandler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}
