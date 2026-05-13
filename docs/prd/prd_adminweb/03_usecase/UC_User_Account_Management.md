# UC - User Account Management

**ID**: UC-A12, UC-A13, UC-A14, UC-A15  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-A12: View User List

### Description
Admin views all registered users with their roles and subscription status.

### Primary Flow
1. Admin navigates to "User Management".
2. System fetches user records from `/api/v1/admin/users`.
3. System displays a table with Email, Role, Premium Status, and Last Login.

---

## UC-A13: Edit User Role (RBAC Elevation)

### Description
Admin changes a user's role (e.g., from USER to OWNER).

### Primary Flow
1. Admin clicks "Edit" on a user.
2. Admin selects a new Role from the dropdown (USER, OWNER, ADMIN).
3. Admin clicks "Update".
4. Backend updates the `role` field in the User document.
5. User must re-authenticate to receive the new JWT with updated permissions.

---

## UC-A15: Grant Premium Subscription

### Description
Admin manually grants premium status to a user for testing or customer support.

### Primary Flow
1. Admin clicks "Grant Premium" on a user.
2. System sets `isPremium = true` and `premiumExpiry` (e.g., +1 year).
3. Backend saves the change.
4. User immediately gains access to long-form narration and higher scan limits.
