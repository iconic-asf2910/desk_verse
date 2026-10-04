package middleware

import (
	"net/http"
	"slices"
)

func RequireRole(allowedRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
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

			if !slices.Contains(allowedRoles, userRole) {
				http.Error(w, "Access denied: Insufficient permissions", http.StatusForbidden)
				return
			}

			next(w, r)
		}
	}
}
