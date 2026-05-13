# UC - Wallet, Purchases & Download Management

This document details the use cases for managing user credits, purchase history, and offline data storage on the mobile app.

## UC-M27: View Purchase History
**Actor**: Traveler
**Priority**: P1
**Description**: User views a list of all zones they have purchased using credits.

**Success Flow**:
1. User navigates to "Profile" -> "Purchase History".
2. App queries `ZonePurchase` table in local SQLite.
3. App displays a chronological list of purchased zones with date and status.
4. User can tap a record to view details or navigate to the zone.

---

## UC-M28: Manage Offline Downloads
**Actor**: Traveler
**Priority**: P1
**Description**: User views all downloaded content and manages storage (delete/re-download).

**Success Flow**:
1. User navigates to "Settings" -> "Download Manager".
2. App calculates total storage used by `audio-packages` folder.
3. App lists all downloaded zones with their storage size.
4. User can tap "Delete" to remove local files and free up space.
5. User can tap "Repair" to re-download missing audio files.

---

## UC-M29: Add Custom Language
**Actor**: Traveler
**Priority**: P2
**Description**: User adds a language not in the pre-defined list.

**Success Flow**:
1. User opens "Language Selector" and taps "Add Other Language".
2. User enters a custom language name/code.
3. App triggers `PoiTranslationService` to fetch translations for all POIs into the new language.
4. If successful, the new language becomes the active preference.

---

## UC-M30: Admin Tools (Internal)
**Actor**: Developer/Admin (via Mobile)
**Priority**: P3
**Description**: Secret menu for clearing cache, toggling debug logs, or force-syncing.

**Success Flow**:
1. User performs a hidden gesture (e.g., tap version number 5 times).
2. "Admin Tools" page opens.
3. User can trigger "Clear SQLite", "Reset Seeding", or "Dump Logs".
