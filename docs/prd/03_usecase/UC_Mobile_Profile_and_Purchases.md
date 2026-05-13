# UC - User Profile & Purchases

**ID**: UC-M24, UC-M25, UC-M26  
**Actor**: Traveler  
**Status**: ✅ Complete

---

## UC-M25: View Credit Balance & History

### Description
The user views their current credit balance and a history of how they have spent or earned credits.

### Primary Flow
1. User navigates to the "Profile" page.
2. System fetches the user's latest profile from the Backend.
3. System displays the current credit balance.
4. User clicks "Purchase History".
5. System shows a list of transactions (Date, Zone Name, Credits Spent).

---

## UC-M24: Purchase Zone Access

### Description
The user spends credits to unlock a specific geographic zone.

### Primary Flow
1. User navigates to the "Explore" or "Zones" page.
2. User selects a locked Zone.
3. System shows the price and user's balance.
4. User clicks "Unlock Now".
5. App sends request to `/api/v1/zones/purchase`.
6. Backend verifies balance, deducts credits, and adds the zone to the user's entitlements.
7. App refreshes the entitlement state and unlocks the POIs in that zone.
