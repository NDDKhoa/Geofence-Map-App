# ACT02 - QR Code Scanning & Processing

This diagram shows the flow when a user scans a QR code.

```mermaid
activityDiagram
    start
    :Open Camera;
    :Scan QR Code;
    if (Valid Format?) then (yes)
        :Extract POI Code;
        :Check Daily Scan Limit (Local);
        if (Limit Reached?) then (no)
            :Query Local SQLite for POI;
            if (POI Exists?) then (yes)
                :Increment Scan Count;
                :Navigate to POI Detail Page;
            else (no)
                :Show "POI Not Found" Error;
            endif
        else (yes)
            :Show "Daily Limit Reached" Warning;
        endif
    else (no)
        :Show "Invalid QR Code" Error;
    endif
    stop
```
