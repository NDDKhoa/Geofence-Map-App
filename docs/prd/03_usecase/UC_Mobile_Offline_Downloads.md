# UC - Mobile Offline Downloads

**ID**: UC-M15, UC-M27  
**Actor**: Traveler  
**Status**: ✅ Complete

---

## UC-M15: Download Language Pack for Offline Use

### Description
The user downloads a specific language pack (e.g., Japanese) to access POI details and narration without an internet connection.

### Primary Flow
1. User navigates to the "Language Selector" or "Download Manager".
2. User selects a language and clicks "Download".
3. System fetches the translation JSON from the server.
4. System saves the content to the local `PoiTranslationCacheEntry` table in SQLite.
5. System confirms download completion.

---

## UC-M27: Download Zone Content

### Description
The user downloads all POI data and audio for a specific geographic zone they have purchased.

### Primary Flow
1. User navigates to "Download Manager".
2. User selects a purchased Zone.
3. System identifies all POIs linked to that Zone.
4. System downloads POI metadata, images, and pre-generated audio files (if available).
5. System updates the `PoiDatabase` and local file storage.
6. User can now navigate that specific zone entirely offline.
