# ACT - Mobile Analytics Event Pipeline

Logic for buffering and reliably sending analytics events to the backend.

```mermaid
activityDiagram
    start
    :Event Generated (Track);
    :Normalize Event (ID, Timestamp, UserContext);
    :Add to Memory Buffer;
    :Save Buffer to "event-buffer.json" (Persistence);
    
    if (Buffer >= Threshold (5) OR Timer (2s) expired?) then (yes)
        :Prepare Batch (Max 10);
        :Attempt POST /api/v1/intelligence/events/batch;
        if (Request Successful?) then (yes)
            :Remove from Memory Buffer;
            :Remove from "event-buffer.json";
        else (no)
            :Keep in Buffer;
            :Retry on next flush cycle;
        endif
    else (no)
        :Wait for next event or timer;
    endif
    
    stop
```
