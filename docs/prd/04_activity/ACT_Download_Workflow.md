# ACT - Offline Audio Download Workflow

Logic for managing background audio downloads for geographic zones.

```mermaid
activityDiagram
    start
    :User selects "Download Zone";
    :Initialize Storage Path (AppData/audio-packages/ZONE/LANG);
    :Identify all POIs in Zone;
    :Emit "DOWNLOAD_STARTED" Event;
    
    foreach (POI in Zone)
        :Build Candidate URLs (Lang-specific -> EN -> VI -> Generic);
        if (Download Successful?) then (yes)
            :Save to local storage;
            :Mark as "manual" source;
        else (no)
            :Mark as "tts" source (fallback to cloud);
        endif
        :Update Download Statistics;
        :Emit "DOWNLOAD_PROGRESS" Event;
    endfor
    
    if (At least one success?) then (yes)
        :Mark Zone as "Downloaded" in SQLite;
        :Emit "DOWNLOAD_COMPLETED" Event;
    else (no)
        :Emit "DOWNLOAD_FAILED" Event;
    endif
    
    stop
```
