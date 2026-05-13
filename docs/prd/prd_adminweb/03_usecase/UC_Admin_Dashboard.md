# UC - Admin Dashboard

**ID**: UC-A01, UC-A02, UC-A03  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-A01: View System Dashboard

### Description
Admin views a consolidated summary of system health and activity.

### Primary Flow
1. Admin logs in.
2. System displays the Dashboard as the landing page.
3. System shows key metrics:
    - **Total Users**
    - **Total Active POIs**
    - **Pending Moderation Queue Count**
    - **Total Revenue (Credits)**
    - **Active Device Sessions**

---

## UC-A03: Monitor Pending Queue Status

### Description
Admin identifies if there is a backlog of content requiring review.

### Primary Flow
1. Admin checks the "Pending Moderation" card on the Dashboard.
2. If count > 0, Admin clicks the card.
3. System navigates the Admin to the Moderation Queue page.
