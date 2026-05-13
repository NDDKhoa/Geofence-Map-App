# UC06 - Analytics & Intelligence

**ID**: UC-B15, UC-B16, UC-B17, UC-A08, UC-A09  
**Actor**: System, Admin  
**Status**: ✅ Complete

---

## UC-B15: Ingest Analytics Events (Batch)

### Description
The mobile app sends batches of user interaction events to the backend for analysis.

### Primary Flow
1. Mobile app captures events (e.g., `poi_view`, `geofence_trigger`) and stores them in an in-memory queue.
2. Once the queue reaches 50 events or 30 seconds have passed, the app sends a batch request to `/api/v1/intelligence/events/batch`.
3. Backend validates the event data schema.
4. Backend inserts the raw events into the `IntelligenceEventRaw` collection.

---

## UC-A08: View Geographic Heatmap (Admin)

### Description
Admin views a heatmap of user activity across the map to identify popular POIs.

### Primary Flow
1. Admin navigates to the "Intelligence/Heatmap" page.
2. System fetches aggregated analytics data from `/api/v1/admin/intelligence/heatmap`.
3. System processes the data to generate intensity values for each coordinate.
4. System renders a heatmap overlay on a Leaflet map.

---

## UC-B16: Aggregate Events to Hourly Rollup

### Description
The system automatically processes raw events into hourly summaries to improve query performance.

### Primary Flow
1. A scheduled background job runs every hour.
2. System queries all raw events from the previous hour.
3. System groups events by `poiCode` and `eventType`.
4. System calculates totals (e.g., total views per POI).
5. System saves the summary into `IntelligenceAnalyticsRollupHourly`.
6. (Optional) Raw events older than a certain age are purged or archived.
