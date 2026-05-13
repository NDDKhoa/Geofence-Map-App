# UC05 - Content Management

**ID**: UC-B06, UC-B11, UC-B12, UC-B13, UC-A04, UC-A05, UC-A06, UC-A16  
**Actor**: Owner, Admin  
**Status**: ✅ Complete

---

## UC-B06: Submit POI for Moderation (Owner)

### Description
An Owner submits a new POI proposal for review by an Admin.

### Primary Flow
1. Owner fills out the POI creation form (Name, Description, Coordinates, Image URL).
2. Owner submits the form.
3. System sends a POST request to `/api/v1/owner/pois`.
4. Backend creates a new POI record with `status: "PENDING"`.
5. Backend returns success.

---

## UC-A05: Approve POI from Queue (Admin)

### Description
An Admin reviews a pending POI and approves it for public view.

### Primary Flow
1. Admin logs into the Web Portal.
2. Admin navigates to the "Pending POIs" section.
3. Admin selects a POI and clicks "Approve".
4. System sends a request to `/api/v1/admin/pois/:id/approve`.
5. Backend updates the POI status to `APPROVED`.
6. Backend creates an audit log entry in `AdminPoiAudit`.
7. Backend returns success.

### Post-conditions
- POI is now visible to all users (after database sync).

---

## UC-A16: View Moderation Audit Log

### Description
An Admin reviews the history of moderation actions taken in the system.

### Primary Flow
1. Admin navigates to the "Audit Log" page on the Web Portal.
2. System fetches audit records from `/api/v1/admin/pois/audits`.
3. System displays a table showing:
    - Date/Time
    - Admin Name
    - POI Name
    - Action (Approve/Reject)
    - Reason (for rejections)
