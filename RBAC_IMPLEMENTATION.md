# Role-Based Authorization Middleware - Implementation Summary

## Files Created/Modified

### Created:
1. **`internal/middleware/role.go`**
   - New middleware function `RequireRole(allowedRoles ...string)`
   - Extracts role from request context (set by `RequireAuth`)
   - Returns HTTP 403 Forbidden if user lacks required role
   - Uses `slices.Contains` for efficient role checking

2. **`internal/middleware/role_test.go`**
   - Unit tests for `RequireRole` middleware
   - Integration tests for `RequireAuth` + `RequireRole` chaining
   - Tests cover: valid roles, invalid roles, missing roles, empty roles
   - All tests passing

### Modified:
3. **`main.go`**
   - Added imports for `middleware` and `models` packages
   - Created demo handler `managerOnlyHandler`
   - Registered protected route: `GET /api/test/manager`
   - Route protected with chained middleware: `RequireAuth(RequireRole(models.RoleManager)(handler))`

## How Role Authorization Works

### Flow:
1. **Request arrives** → `RequireAuth` middleware runs first
2. **JWT validation** → Token is parsed, claims extracted
3. **Context enrichment** → `UserID` and `Role` stored in request context using `middleware.UserIDKey` and `middleware.RoleKey`
4. **Role check** → `RequireRole` middleware reads `RoleKey` from context
5. **Authorization decision**:
   - Role matches allowed list → Request passes to handler (200 OK)
   - Role doesn't match → HTTP 403 Forbidden
   - Role missing/invalid → HTTP 403 Forbidden

### HTTP Status Codes:
- **401 Unauthorized** → Invalid/missing JWT token (from `RequireAuth`)
- **403 Forbidden** → Valid token but insufficient role (from `RequireRole`)
- **200 OK** → Authenticated and authorized

## Usage Examples

### Protecting a route (single role):
```go
http.HandleFunc("/api/admin/dashboard", 
    middleware.RequireAuth(
        middleware.RequireRole(models.RoleManager)(adminDashboardHandler)
    ))
```

### Protecting a route (multiple roles):
```go
http.HandleFunc("/api/reports", 
    middleware.RequireAuth(
        middleware.RequireRole(models.RoleManager, models.RoleSupervisor)(reportsHandler)
    ))
```

### Available roles (from `internal/models/user.go`):
- `models.RoleManager` → `"manager"`
- `models.RoleSupervisor` → `"supervisor"`
- `models.RoleTeamMember` → `"team_member"`

## Build and Test Results

```
✓ go fmt ./...        (formatted successfully)
✓ go build ./...      (compiled successfully)
✓ go test ./...       (all tests pass)
```

### Test Results:
- `TestRequireRole`: 5/5 scenarios passed
  - Allowed role (single)
  - Allowed role (multiple)
  - Disallowed role
  - Missing role in context
  - Empty role in context

- `TestFullAuthAndRoleChaining`: 4/4 scenarios passed
  - No auth header → 401
  - Invalid token → 401
  - Valid token, wrong role → 403
  - Valid token, correct role → 200

## Notes

- The middleware is reusable and composable
- `RequireAuth` must always be applied before `RequireRole`
- Role information comes from JWT claims (set during login/signup)
- New users get `RoleTeamMember` by default (see `internal/auth/auth.go:96`)
- No database queries in authorization flow (role comes from signed JWT)
