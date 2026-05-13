# UC - Master POI Management

**ID**: UC-M01, UC-M05, UC-M07  
**Actor**: Admin  
**Status**: ✅ Complete

---

## UC-M01: Create Master POI

### Description
Admin creates a new source-of-truth POI that will be distributed to all mobile clients.

### Primary Flow
1. Admin navigates to "Master POIs".
2. Admin clicks "+ THÊM POI MỚI".
3. Admin enters the following:
    - **Mã POI** (Unique Code, e.g., "HANOI_001")
    - **Tọa độ** (Lat/Lng)
    - **Tên địa điểm** (Vietnamese as base)
    - **Bán kính (m)** (Geofence radius)
    - **Độ ưu tiên** (Sorting order)
4. Admin clicks "XÁC NHẬN".
5. Backend creates the record and notifies all sync nodes.

---

## UC-M05: Manage Translations (Translation Workflow)

### Description
Admin manages the multi-language content (EN, JA, KO, FR, ZH) for a specific POI.

### Primary Flow
1. Admin opens the Edit modal for a POI.
2. Admin selects the "BẢN DỊCH ĐA NGÔN NGỮ" tab.
3. System loads existing translations.
4. Admin can:
    - **Auto-Translate**: Use the Langbly/Google API to generate translations.
    - **Manual Edit**: Review and correct machine translations.
    - **Mark Verified**: Flag the translation as manually reviewed.
5. Admin clicks "Save".
6. Backend updates the `localizedContent` object in MongoDB.

---

## UC-M07: Bulk Delete POIs

### Description
Admin deletes a POI record permanently.

### Primary Flow
1. Admin clicks "Xóa" on a POI row.
2. System shows a confirmation modal with the POI code.
3. Admin confirms the deletion.
4. Backend marks the record as deleted (soft delete) or removes it.
5. Record is purged from Mobile SQLite caches during the next sync.
