# UC - Advanced Analytics

**ID**: UC-A10, UC-A11  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-A10: View Audio Engagement Metrics

### Description
Admin reviews how users interact with audio narration to identify high-performing content.

### Primary Flow
1. Admin navigates to "Audio Analytics".
2. System fetches events filtered by `eventType = 'audio_play'`.
3. System calculates:
    - **Top Narrations**: POIs with most audio plays.
    - **Completion Rate**: How much of the audio is typically heard.
    - **Language Distribution**: Which languages are used for audio.
4. System renders bar charts and trend lines.

---

## UC-B19: Reconstruct User Journey

### Description
Admin traces the path of a specific user/device to debug issues or understand behavior.

### Primary Flow
1. Admin enters a `deviceId` in the "Intelligence/Journeys" search.
2. System fetches all events for that device sorted by timestamp.
3. System visualizes the events chronologically on a map or timeline.
