# UC - Admin Moderation

**ID**: UC-A04, UC-A05, UC-A06  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-A04: View Pending POI Queue

### Description
Admin retrieves a list of all POIs submitted by Owners that are currently in the `PENDING` status.

### Primary Flow
1. Admin logs into the Admin Web Portal.
2. Admin navigates to the "Moderation" tab.
3. System sends a `GET /api/v1/admin/pois/pending` request.
4. Backend retrieves PENDING POIs from MongoDB.
5. System displays the POIs in a list or grid with basic info (Name, Owner, Date).

---

## UC-A05: Approve POI from Queue

### Description
Admin reviews a POI and marks it as approved, making it public.

### Primary Flow
1. Admin selects a POI from the Pending Queue.
2. Admin reviews details (coordinates, description, image).
3. Admin clicks "Approve".
4. System sends `POST /api/v1/admin/pois/:id/approve`.
5. Backend updates POI status to `APPROVED`.
6. Backend creates an audit log entry.
7. System shows success notification and removes POI from the pending queue.

---

## UC-A06: Reject POI with Reason

### Description
Admin rejects a POI and provides a reason for the Owner.

### Primary Flow
1. Admin selects a POI from the Pending Queue.
2. Admin clicks "Reject".
3. System prompts for a "Rejection Reason".
4. Admin enters the reason (e.g., "Invalid coordinates").
5. System sends `POST /api/v1/admin/pois/:id/reject` with the reason.
6. Backend updates POI status to `REJECTED`.
7. Backend creates an audit log entry with the reason.
