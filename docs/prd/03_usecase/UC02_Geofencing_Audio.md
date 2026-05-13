# UC02 - Geofencing & Audio Narration

**ID**: UC-M06, UC-M07, UC-M08  
**Actor**: Traveler  
**Status**: ✅ Complete

---

## UC-M06: Automatic Audio Narration on POI Entry

### Description
The system automatically plays a short audio narration when the user enters a POI's geofence.

### Pre-conditions
- Background location polling is active.
- Audio permissions granted.

### Primary Flow
1. System polls GPS every 5 seconds.
2. System calculates distances to all POIs.
3. System detects that the user's distance to a POI is less than the geofence radius (e.g., 50 meters).
4. System checks if this POI has been narrated recently (cooldown check).
5. System invokes the `AudioPlayerService` to speak the narration text.
6. System marks the POI as "recently narrated" to prevent immediate repetition.

### Post-conditions
- User hears the narration without manual intervention.

---

## UC-M07: Manually Play POI Audio Narration

### Description
The user manually triggers the full audio narration from a POI's detail page.

### Primary Flow
1. User selects a POI pin or list item.
2. User navigates to the PoiDetailPage.
3. User taps the "Play Audio" button.
4. System invokes the `AudioPlayerService` with the long narration text.
5. System displays playback controls (Pause, Stop).

---

## UC-M08: Pause/Resume Audio Playback

### Description
The user controls the ongoing audio narration.

### Primary Flow
1. While audio is playing, user taps "Pause".
2. System stops the TTS engine and preserves the current position (if supported by platform) or simply stops.
3. User taps "Resume" (or "Play").
4. System restarts the narration.
