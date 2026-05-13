# UC - Audit & Compliance

**ID**: UC-A16, UC-A17, UC-A18  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-A16: View Moderation Audit Log

### Description
Admin reviews a historical record of all moderation decisions (Approve/Reject) made in the system.

### Primary Flow
1. Admin navigates to "Audit Logs".
2. System fetches audit entries from `/api/v1/admin/pois/audits`.
3. System displays a table with:
    - **Timestamp**
    - **Moderator** (Admin Email)
    - **POI Code**
    - **Action** (Approve/Reject)
    - **Reason** (if rejected)

---

## UC-A17: Search Audit Log by Criteria

### Description
Admin filters the audit logs to find specific moderation actions.

### Primary Flow
1. Admin enters a POI Code or Admin Email in the search bar.
2. Admin selects an Action Type (e.g., "REJECT").
3. System filters the records in real-time or via a backend query.
4. System displays the matching audit entries.

---

## UC-A18: Export Audit Log to CSV

### Description
Admin downloads the audit history for external reporting or legal compliance.

### Primary Flow
1. Admin clicks "Export to CSV".
2. System generates a CSV file containing all (or filtered) audit records.
3. User downloads the file to their device.
