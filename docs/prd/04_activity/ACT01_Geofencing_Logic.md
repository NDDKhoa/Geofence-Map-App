# ACT01 - Geofencing & Audio Trigger Logic

This diagram illustrates the background logic used by the MAUI Mobile App to detect POI proximity and trigger audio narration.

```mermaid
activityDiagram
    start
    :Wait for Location Poll Interval (5s);
    :Get Current GPS Coordinates;
    if (GPS Signal Acquired?) then (yes)
        :Load All POIs from Local DB;
        repeat
            :Get Next POI;
            :Calculate Distance (Haversine);
            if (Distance < Geofence Radius?) then (yes)
                if (POI in Cooldown?) then (no)
                    :Trigger Audio Narration;
                    :Update Last Narration Timestamp;
                else (yes)
                    :Ignore Trigger;
                endif
            else (no)
                :Continue;
            endif
        repeat while (More POIs?)
    else (no)
        :Log GPS Signal Loss;
    endif
    stop
```
