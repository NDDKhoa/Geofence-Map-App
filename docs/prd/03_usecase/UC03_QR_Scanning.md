# UC03 - QR Code Scanning

**ID**: UC-M10, UC-M11, UC-M12  
**Actor**: Traveler  
**Status**: ✅ Complete

---

## UC-M10: Scan QR Code to Access POI

### Description
The user scans a physical QR code at a location to instantly view POI details.

### Pre-conditions
- Camera permission granted.

### Primary Flow
1. User taps the "QR Scanner" button in the app.
2. System opens the camera view using ZXing.
3. User points the camera at a valid POI QR code.
4. System extracts the POI code from the QR data.
5. System queries the local SQLite database for the POI.
6. System navigates the user to the PoiDetailPage for that POI.

### Post-conditions
- POI details are displayed.

---

## UC-M12: Check Daily QR Scan Limit

### Description
The system restricts the number of QR scans for free-tier users.

### Primary Flow
1. After extracting a POI code, system checks the local `AppPreferences` or `SecureStorage` for the current day's scan count.
2. If count < 5 (default limit):
    a. System increments the count.
    b. System proceeds with navigation.
3. If count >= 5:
    a. System displays a warning: "Daily scan limit reached. Please wait until tomorrow or upgrade to Premium."
    b. System aborts navigation.
