# UC - Admin Analytics & Heatmap

**ID**: UC-A08, UC-A09, UC-A10  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-A08: View Geographic Heatmap

### Description
Admin views user engagement density on a map to understand popular areas.

### Primary Flow
1. Admin navigates to the "Analytics" tab.
2. System sends `GET /api/v1/admin/intelligence/heatmap`.
3. Backend performs an aggregation on the `IntelligenceAnalyticsRollupHourly` collection.
4. Backend returns an array of coordinates and weights.
5. System renders the heatmap overlay using Leaflet.heat.

---

## UC-A09: Filter Heatmap by Date Range

### Description
Admin filters the heatmap to see user activity during a specific period.

### Primary Flow
1. Admin clicks the "Date Picker" on the Heatmap page.
2. Admin selects a Start Date and End Date.
3. System sends `GET /api/v1/admin/intelligence/heatmap?startDate=...&endDate=...`.
4. Backend filters the aggregation by the provided date range.
5. System updates the map with the new data.
