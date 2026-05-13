# UC - Zones & Subscriptions

**ID**: UC-B20, UC-B21, UC-B23  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-B20: Create Zone Package

### Description
Admin defines a geographic area (Zone) that users can purchase as a bundle.

### Primary Flow
1. Admin navigates to "Zones Management".
2. Admin clicks "+ NEW ZONE".
3. Admin enters:
    - **Zone Name** (e.g., "Old Quarter Essentials")
    - **Description**
    - **Price in Credits** (e.g., 500 credits)
4. Admin clicks "Create".

---

## UC-B21: Add POIs to Zone

### Description
Admin links existing POIs to a specific zone.

### Primary Flow
1. Admin selects a Zone from the list.
2. Admin clicks "Manage POIs".
3. System shows a list of all available POIs.
4. Admin checks the POIs that belong to this zone.
5. Admin clicks "Link POIs".
6. Backend updates the `Zone` document with the list of `poiCodes`.

---

## UC-A18: View Sales Analytics

### Description
Admin views revenue and purchase trends for zones and subscriptions.

### Primary Flow
1. Admin navigates to "Revenue Analytics".
2. System fetches data from `/api/v1/admin/revenue/stats`.
3. System displays charts for:
    - Total Credits Sold
    - Most Popular Zones
    - Active Subscriptions vs Free Users
