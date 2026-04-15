# 6. Class Diagram (Textual Pre-UML)

## 6.1 Class Grouping

## ViewModels
- `MapViewModel`
- `QrScannerViewModel`
- `PoiDetailViewModel`
- `LanguageSelectorViewModel`

## Services
- State/Navigation:
  - `AppState`
  - `NavigationService`
  - `DeepLinkCoordinator`
- POI domain:
  - `PoiHydrationService`
  - `PoiEntryCoordinator`
  - `PoiFocusService`
  - `PoiNarrationService`
  - `GeofenceService`
  - `PoiTranslationService`
  - `LocalizationService`
  - `PoiDatabase`
- Infra/service wrappers:
  - `ApiService`
  - `AuthService`
  - `AudioService`
  - `DeviceLocationService`

## Models
- Mobile:
  - `Poi`
  - `PoiLocalization`
  - `PoiTranslationCacheEntry`
  - `LocalizationResult`
  - `QrParseResult`
  - `PoiEntryRequest` / `PoiEntryResult`
- Backend:
  - `Poi` (mongoose model)
  - `PoiRequest`
  - `AdminPoiAudit`
  - `User`

## Coordinators
- `PoiEntryCoordinator` (QR/deep-link entry orchestration)
- `DeepLinkCoordinator` (Android intent -> app flow dispatch)

## 6.2 Core Relationships (Dependency / Composition / Data Flow)

- `MapPage` -> `MapViewModel` (UI binding)
- `MapViewModel` -> `PoiHydrationService`, `PoiNarrationService`, `PoiFocusService`, `LanguageSwitchService`, `GeofenceService`, `AppState`
- `PoiHydrationService` -> `IPoiQueryRepository`/`IPoiCommandRepository` (`PoiDatabase`), `LocalizationService`, `ApiService`, `AuthService`
- `PoiTranslationService` -> repositories + translator + `LocalizationService`
- `GeofenceService` -> `AppState` + `IAudioPlayerService`
- `QrScannerViewModel` -> `PoiEntryCoordinator` + `NavigationService`
- `PoiEntryCoordinator` -> QR parser/service + local repositories + API + navigation + app state
- `NavigationService` -> `Shell` + `AppState` modal state

Backend side:
- Route/controller -> `poi.service.js`
- `poi.service.js` -> repositories/models + cache + audit service
- repositories -> Mongo models

## 6.3 God Classes / Tight Coupling Areas

## God-class tendencies
- `backend/src/services/poi.service.js`:
  - chứa quá nhiều trách nhiệm: CRUD, validation, moderation, mapping DTO, scan token, quota, caching.
- `MapPage.xaml.cs`:
  - UI rendering + tracking loop + auto-select logic + audio trigger + sync continuation.
- `MapViewModel` (giai đoạn hiện tại là "heavy coordinator", chưa hoàn toàn god-class):
  - đã tách bớt trách nhiệm ra services, nhưng vẫn là điểm hội tụ nhiều dependency và event wiring.

## Tight coupling points
- `MapViewModel` vẫn phụ thuộc nhiều service và AppState event wiring.
- QR flow lock chain (VM -> coordinator -> navigation) phức tạp, khó quan sát lỗi race.
- Dữ liệu localization phân tầng (json/in-memory/cache) làm tăng coupling logic đọc nội dung.

## 6.4 Suggested Diagram Segments For Mermaid Class Diagram

Khi vẽ UML:
- Segment A: `Views` <-> `ViewModels`.
- Segment B: `ViewModels` -> `Services`.
- Segment C: `Services` -> `Repositories` -> `SQLite/Mongo`.
- Segment D: `Coordinator` interactions (`PoiEntryCoordinator`, `DeepLinkCoordinator`).

Nên đánh dấu stereotype:
- `<<god-class>>` cho `PoiService` (backend) và `MapPage` (mobile UI code-behind).
- `<<high-coupling>>` cho `MapViewModel`.
