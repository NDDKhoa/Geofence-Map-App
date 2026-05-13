# UC01 - Map Discovery

**ID**: UC-M01, UC-M02, UC-M03, UC-M05  
**Actor**: Traveler  
**Status**: ✅ Complete

---

## UC-M01: View POIs on Map

### Description
The user views points of interest (POIs) as pins on an interactive map.

### Pre-conditions
- User has opened the MAUI Mobile App.
- GPS is enabled (optional but recommended).
- Offline POI database is loaded.

### Primary Flow
1. User navigates to the Map page.
2. System retrieves all POIs from the local SQLite database.
3. System renders POI pins on the map at their respective coordinates.
4. System centers the map on the user's current location (if GPS available) or a default location.

### Post-conditions
- POIs are visible on the map.

---

## UC-M03: Search POIs by Name

### Description
The user searches for specific POIs by typing a name in the search bar.

### Primary Flow
1. User enters text in the search bar on the Map page.
2. System filters the local POI database for names containing the search string (case-insensitive).
3. System updates the map or list view to show only matching POIs.
4. User selects a POI from the results.
5. System pans the map to the selected POI and shows detail summary.

---

## UC-M05: View Nearby POIs List

### Description
The user views a list of POIs sorted by proximity to their current location.

### Pre-conditions
- GPS is enabled and location is acquired.

### Primary Flow
1. User switches from Map view to List view.
2. System calculates the distance from the user to every POI in the database (Haversine formula).
3. System sorts the list by distance (ascending).
4. System displays the POIs with their distance and a brief summary.
