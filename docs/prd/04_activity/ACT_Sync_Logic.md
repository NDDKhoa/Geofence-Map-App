# ACT - Mobile Data Sync & Hydration

This diagram describes the logic for synchronizing the mobile app's local SQLite database with the backend server.

```mermaid
activityDiagram
    start
    :App Bootstrap;
    :Initialize PoiDatabase (SQLite);
    if (Database Empty?) then (yes)
        :Seed from pois.json (Embedded Resource);
    else (no)
        :Skip Seeding;
    endif
    
    :Load Base POIs into Memory;
    :Apply Preferred Language Localization;
    
    if (Network Available?) then (yes)
        :Fetch Nearby POIs from Server;
        :Radius = 1,800,000m (Vietnam Scope);
        foreach (POI in API Response)
            if (POI exists in local DB?) then (yes)
                :Compare Version/Metadata;
                :Update record if changed;
            else (no)
                :Insert new POI record;
            endif
            :Cache Dynamic Translations;
        endfor
        :Refresh UI Collection (AppState.Pois);
        :Track Sync Analytics Event;
    else (no)
        :Run in Offline Mode;
    endif
    
    stop
```
