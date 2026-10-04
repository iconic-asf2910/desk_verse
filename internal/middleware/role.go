package middleware

import (
	"net/http"
	"slices"
)

// RequireRole is a middleware that restricts access to users with one of the allowed roles.
// It assumes that RequireAuth middleware has already run and set RoleKey in the context.
func RequireRole(allowedRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Extract the role from the context
			roleVal := r.Context().Value(RoleKey)
			if roleVal == nil {
				http.Error(w, "Access denied: Missing role information", http.StatusForbidden)
				return
			}

			userRole, ok := roleVal.(string)
			if !ok || userRole == "" {
				http.Error(w, "Access denied: Invalid role information", http.StatusForbidden)
				return
			}

			// Check if the user's role is in the list of allowed roles
			if !slices.Contains(allowedRoles, userRole) {
				http.Error(w, "Access denied: Insufficient permissions", http.StatusForbidden)
				return
			}

			// User has an allowed role, proceed to the next handler
			next(w, r)
		}
	}
}
