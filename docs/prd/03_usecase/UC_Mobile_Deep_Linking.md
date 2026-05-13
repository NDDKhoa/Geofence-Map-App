# UC - Mobile Deep Linking

**ID**: UC-M28  
**Actor**: Traveler  
**Status**: ✅ Complete

---

## UC-M28: Handle Internal/External Deep Links

### Description
The app automatically navigates to a specific POI or page when a user clicks a custom URI scheme (`poi://`) or a universal link.

### Primary Flow
1. User clicks a link (e.g., in an SMS, email, or browser) such as `poi://HANOI_001`.
2. The OS resolves the link and opens the VN-GO Travel app.
3. `DeepLinkHandler` intercepts the URI.
4. `DeepLinkCoordinator` parses the code ("HANOI_001").
5. System checks if the POI exists in the local database.
6. System navigates the user directly to the `PoiDetailPage` for that code.

### Alternate Flow: Universal Link
1. User clicks `https://vngo.travel/poi/HANOI_001`.
2. OS opens the app and passes the URL.
3. App strips the base URL and extracts the POI code.
4. App navigates to the POI.
