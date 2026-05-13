# UC04 - Authentication & Authorization

**ID**: UC-M16, UC-M17, UC-B01, UC-B02  
**Actor**: Traveler, Owner, Admin, System  
**Status**: ✅ Complete

---

## UC-M17: Login to Account

### Description
A user logs in to access their profile and premium features.

### Primary Flow
1. User enters email and password on the LoginPage.
2. System validates input formats.
3. System sends a POST request to `/api/v1/auth/login`.
4. Backend verifies credentials against the database.
5. Backend generates a JWT token.
6. Backend returns the token and user profile.
7. System stores the token in `SecureStorage`.
8. System updates the global app state to "Authenticated".

### Post-conditions
- User is logged in.

---

## UC-B02: Validate User Role (RBAC)

### Description
The system restricts access to specific API endpoints based on the user's role (USER, OWNER, ADMIN).

### Primary Flow
1. Client sends a request with an Authorization header.
2. Backend `authMiddleware` verifies the JWT.
3. Backend `rbacMiddleware` checks the user's role against the route's requirements.
4. If the user's role is sufficient (e.g., ADMIN for moderation routes), the request proceeds.
5. If insufficient, the system returns a `403 Forbidden` response.
