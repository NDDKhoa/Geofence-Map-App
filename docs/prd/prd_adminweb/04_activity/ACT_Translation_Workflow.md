# ACT - Translation & Localization Workflow

This diagram describes the decision tree for managing POI content in multiple languages.

```mermaid
activityDiagram
    start
    :Admin edits POI;
    :Open Translations Tab;
    :Select Target Language (e.g., EN);
    if (Translation Exists?) then (yes)
        :Load Current Content;
    else (no)
        :Fetch VI Content as Source;
        :Request Machine Translation (Langbly);
        :Show "Draft" Translation;
    endif
    
    :Admin Reviews Content;
    if (Accept Machine Version?) then (yes)
        :Mark as "Auto-Verified";
    else (no)
        :Manually Edit Text;
        :Mark as "Manually Verified";
    endif
    
    :Save Localized Content;
    :Increment POI Version Number;
    :Trigger App Cache Refresh;
    stop
```
