# ACT04 - POI Submission & Moderation Workflow

This diagram shows the lifecycle of a POI from submission to approval.

```mermaid
activityDiagram
    start
    :Owner Submits POI Form;
    :Backend creates PENDING POI;
    :Admin views Moderation Queue;
    :Admin reviews POI details;
    if (POI meets criteria?) then (yes)
        :Admin clicks Approve;
        :Update POI Status to APPROVED;
        :Create Admin Audit Record;
        :POI becomes visible to public;
    else (no)
        :Admin clicks Reject;
        :Enter Rejection Reason;
        :Update POI Status to REJECTED;
        :Create Admin Audit Record;
    endif
    stop
```
