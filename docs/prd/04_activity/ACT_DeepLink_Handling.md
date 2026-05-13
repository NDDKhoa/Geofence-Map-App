# ACT - Deep Link Routing Logic

Logic for handling custom URI schemes and universal links.

```mermaid
activityDiagram
    start
    :Incoming URI (poi://CODE or https://vngo.travel/poi/CODE);
    :DeepLinkHandler Intercepts;
    :Extract POI Code;
    if (Code is valid?) then (yes)
        :Navigate to PoiDetailPage;
        :Pass Code as Parameter;
        :PoiDetailPage initializes;
        if (POI found in local DB?) then (yes)
            :Display POI Details;
            :Track "deep_link_open" Event;
        else (no)
            :Show "POI Not Found" Error;
            :Track "deep_link_failed" Event;
        endif
    else (no)
        :Ignore Link / Open Home;
    endif
    stop
```
