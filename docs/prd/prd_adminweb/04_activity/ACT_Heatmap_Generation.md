# ACT - Heatmap Data Generation Logic

This diagram describes the backend process for transforming user events into heatmap data.

```mermaid
activityDiagram
    start
    :Admin requests Heatmap (with Date Filter);
    :Query IntelligenceAnalyticsRollupHourly;
    :Filter by Date Range;
    :Group results by poiCode;
    :Sum "count" for each poiCode;
    :Join with Poi Collection (to get Lat/Lng);
    if (POI Found?) then (yes)
        :Create Data Point {lat, lng, weight: totalCount};
    else (no)
        :Log Warning (Dangling Analytics);
    endif
    :Normalize weights (0.0 to 1.0);
    :Return JSON Array to Frontend;
    :Frontend renders Leaflet Gradient;
    stop
```
