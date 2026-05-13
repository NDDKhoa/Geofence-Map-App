# ERD - Zone & Subscription

**Domain**: Zone & Subscription Management  
**Subsystem**: Backend (MongoDB) + MAUI (Access State)  
**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Entity Relationship Diagram

```mermaid
erDiagram
    Zone ||--o{ Purchase : "purchased via"
    User ||--o{ Purchase : "makes"
    User ||--o{ CreditTransaction : "has"
    User ||--o{ Subscription : "has"
    
    Zone {
        ObjectId _id PK
        string code UK "unique, uppercase"
        string name "required"
        string description
        number price "credits, min: 1, default: 10"
        boolean isActive "default: true, indexed"
        array poiCodes "denormalized POI codes"
        string imageUrl "nullable"
        number displayOrder "default: 0"
        array tags "lowercase"
        date createdAt
        date updatedAt
    }
    
    Purchase {
        ObjectId _id PK
        ObjectId userId FK "ref: User, required"
        string zoneCode FK "ref: Zone.code, required"
        number creditsPaid "required"
        date purchasedAt "default: now, indexed"
        boolean isActive "default: true"
    }
    
    CreditTransaction {
        ObjectId _id PK
        ObjectId userId FK "ref: User, required"
        enum type "PURCHASE|EARN|SPEND|REFUND"
        number amount "can be negative"
        number balanceAfter "snapshot"
        string description "transaction note"
        string relatedEntity "e.g., zoneCode, poiCode"
        date createdAt "indexed"
    }
    
    Subscription {
        ObjectId _id PK
        ObjectId userId FK UK "ref: User, unique"
        enum tier "FREE|PREMIUM|ENTERPRISE"
        enum status "ACTIVE|CANCELLED|EXPIRED"
        date startDate "required"
        date endDate "nullable"
        number creditsPerMonth "default: 0"
        date createdAt
        date updatedAt
    }
```

---

## Entity Specifications

### Zone

**Purpose**: Bundled POI packages for specific tourist areas (e.g., "Hanoi Old Quarter", "Ho Chi Minh City Center").

**Schema Location**: `backend/src/models/zone.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| code | String | Required, Unique, Uppercase | Stable zone identifier (e.g., "HN_OLD_QUARTER") |
| name | String | Required | Display name |
| description | String | Default: "" | Zone description |
| price | Number | Required, Min: 1, Default: 10 | Credit cost to unlock zone |
| isActive | Boolean | Default: true, Indexed | Visibility flag |
| poiCodes | [String] | Array, Uppercase | Denormalized list of POI codes in zone |
| imageUrl | String | Nullable | Zone thumbnail image |
| displayOrder | Number | Default: 0 | Sort order for UI display |
| tags | [String] | Array, Lowercase | Searchable tags (e.g., "historical", "cultural") |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last modification timestamp |

**Indexes**:
- `code`: Unique index
- `isActive + displayOrder`: Composite index for sorted active zones
- `tags`: For tag-based search

**Virtual Fields**:
- `poiCount`: Computed from poiCodes.length

**Instance Methods**:
- `addPoi(poiCode)`: Add POI to zone (updates poiCodes array)
- `removePoi(poiCode)`: Remove POI from zone

**Static Methods**:
- `findActive()`: Returns all active zones sorted by displayOrder
- `findZonesContainingPoi(poiCode)`: Find zones containing specific POI

**Business Rules**:
1. **Denormalization**: poiCodes array duplicates Poi.zoneCode for performance
2. **Consistency**: Adding/removing POIs should update both Zone.poiCodes and Poi.zoneCode
3. **Pricing**: Zone price is in credits (not real currency)
4. **Visibility**: Only isActive=true zones shown to users

---

### Purchase

**Purpose**: Track user purchases of zone access.

**Schema Location**: `backend/src/models/purchase.model.js` (inferred)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| userId | ObjectId | Required, FK | User who made purchase |
| zoneCode | String | Required, FK | Zone code purchased |
| creditsPaid | Number | Required | Credits spent on purchase |
| purchasedAt | Date | Default: now, Indexed | Purchase timestamp |
| isActive | Boolean | Default: true | Access status (can be revoked) |

**Indexes**:
- `userId + zoneCode`: Composite index for access checks
- `purchasedAt`: For purchase history queries

**Business Rules**:
1. **Access Check**: User has access if Purchase exists with isActive=true
2. **No Refunds**: Once purchased, access is permanent (unless manually revoked)
3. **Credit Deduction**: Purchase creates corresponding CreditTransaction (type=SPEND)

**Access Check Flow**:
```javascript
const hasAccess = await Purchase.exists({ 
  userId, 
  zoneCode, 
  isActive: true 
});
```

---

### CreditTransaction

**Purpose**: Ledger of all credit movements for audit and balance tracking.

**Schema Location**: `backend/src/models/credit-transaction.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| userId | ObjectId | Required, FK, Indexed | User account |
| type | Enum | Required | PURCHASE, EARN, SPEND, REFUND |
| amount | Number | Required | Credit delta (positive or negative) |
| balanceAfter | Number | Required | Snapshot of balance after transaction |
| description | String | Optional | Human-readable note |
| relatedEntity | String | Optional | Related zoneCode, poiCode, etc. |
| createdAt | Date | Auto, Indexed | Transaction timestamp |

**Indexes**:
- `userId + createdAt`: For user transaction history
- `type`: For transaction type analytics

**Transaction Types**:
- **PURCHASE**: User buys credits (amount > 0)
- **EARN**: User earns credits (e.g., referral, approved POI submission) (amount > 0)
- **SPEND**: User spends credits (e.g., zone unlock) (amount < 0)
- **REFUND**: Credits returned (amount > 0)

**Business Rules**:
1. **Immutable**: Transactions cannot be edited or deleted
2. **Balance Snapshot**: balanceAfter provides audit trail
3. **Atomic**: Transaction creation and balance update must be atomic

**Balance Calculation**:
```javascript
// Current balance = sum of all transactions
const balance = await CreditTransaction.aggregate([
  { $match: { userId } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
]);
```

---

### Subscription

**Purpose**: User subscription tier and status.

**Schema Location**: `backend/src/models/subscription.model.js` (inferred)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| userId | ObjectId | Required, Unique, FK | User account (one subscription per user) |
| tier | Enum | Required | FREE, PREMIUM, ENTERPRISE |
| status | Enum | Required | ACTIVE, CANCELLED, EXPIRED |
| startDate | Date | Required | Subscription start date |
| endDate | Date | Nullable | Subscription end date (null for active) |
| creditsPerMonth | Number | Default: 0 | Monthly credit allocation |
| createdAt | Date | Auto | Record creation timestamp |
| updatedAt | Date | Auto | Last modification timestamp |

**Indexes**:
- `userId`: Unique index
- `status`: For active subscription queries

**Subscription Tiers**:

| Tier | Credits/Month | Features |
|------|---------------|----------|
| FREE | 0 | Limited QR scans (5/day), public POIs only |
| PREMIUM | 50 | Unlimited QR scans, all POIs, 50 credits/month |
| ENTERPRISE | 200 | All PREMIUM features, 200 credits/month, priority support |

**Business Rules**:
1. **One Subscription Per User**: userId is unique
2. **Status Transitions**: ACTIVE → CANCELLED → EXPIRED
3. **Credit Allocation**: Monthly credits added via scheduled job
4. **Sync with User.isPremium**: Subscription.status=ACTIVE should set User.isPremium=true

---

## Relationships

### User → Zone (M:N via Purchase)
- **Type**: Many-to-Many
- **Cardinality**: One user can purchase multiple zones; one zone can be purchased by multiple users
- **Enforcement**: Purchase junction table
- **Access Check**: Query Purchase table for userId + zoneCode

### User → CreditTransaction (1:N)
- **Type**: One-to-Many
- **Cardinality**: One user has many transactions
- **Enforcement**: Foreign key via CreditTransaction.userId
- **Cascade**: User deletion should preserve transactions (audit trail)

### User → Subscription (1:1)
- **Type**: One-to-One
- **Cardinality**: One user has one subscription
- **Enforcement**: Unique index on Subscription.userId
- **Cascade**: User deletion should delete subscription

### Zone → POI (1:N)
- **Type**: One-to-Many (denormalized)
- **Cardinality**: One zone contains multiple POIs
- **Enforcement**: Zone.poiCodes array + Poi.zoneCode field
- **Consistency**: Manual sync required (no FK constraint)

---

## Business Flows

### Zone Purchase Flow

```
1. User views zone details (GET /api/v1/zones/:code)
2. User initiates purchase (POST /api/v1/zones/:code/purchase)
3. Backend checks user credit balance
4. If sufficient:
   a. Create Purchase record (userId, zoneCode, creditsPaid)
   b. Create CreditTransaction (type=SPEND, amount=-price)
   c. Update user credit balance
   d. Return success
5. If insufficient:
   a. Return error (insufficient credits)
```

### Credit Earning Flow (Owner POI Approval)

```
1. Admin approves owner-submitted POI
2. Backend creates CreditTransaction (type=EARN, amount=+10, userId=submittedBy)
3. User credit balance increases
4. User receives notification (not implemented in MVP)
```

### Subscription Renewal Flow

```
1. Scheduled job runs daily at midnight UTC
2. Query Subscription where status=ACTIVE and endDate < today
3. For each expired subscription:
   a. Set status=EXPIRED
   b. Set User.isPremium=false
4. For each active subscription:
   a. If new month, create CreditTransaction (type=EARN, amount=creditsPerMonth)
```

---

## MAUI Integration

### Zone Access State (MAUI)

**Purpose**: Cache user's zone access status for offline operation.

**Implementation**: `Models/Entities/ZoneAccessEntities.cs`

**Data Structure**:
```csharp
public class ZoneAccessState
{
    public string ZoneCode { get; set; }
    public bool HasAccess { get; set; }
    public DateTime? PurchasedAt { get; set; }
}
```

**Sync Flow**:
```
1. MAUI calls GET /api/v1/user/zones/access
2. Backend returns list of purchased zones
3. MAUI caches in memory (not persisted to SQLite in MVP)
4. POI display logic checks HasAccess before showing premium content
```

**Offline Behavior**:
- If no cached access state, assume no access (fail-safe)
- User must be online at least once to sync access state

---

## API Endpoints

### Zone Management

**GET /api/v1/zones**
- **Auth**: Optional (public zones visible to all)
- **Response**: List of active zones with POI count

**GET /api/v1/zones/:code**
- **Auth**: Optional
- **Response**: Zone details with POI list

**POST /api/v1/zones/:code/purchase**
- **Auth**: Required (USER role)
- **Body**: None (price is fixed)
- **Response**: Purchase confirmation + updated credit balance

### User Credit Management

**GET /api/v1/user/credits/balance**
- **Auth**: Required
- **Response**: Current credit balance

**GET /api/v1/user/credits/transactions**
- **Auth**: Required
- **Query**: ?page=1&limit=20
- **Response**: Paginated transaction history

### Admin Zone Management

**POST /api/v1/admin/zones**
- **Auth**: Admin only
- **Body**: Zone details
- **Response**: Created zone

**PUT /api/v1/admin/zones/:code**
- **Auth**: Admin only
- **Body**: Updated zone fields
- **Response**: Updated zone

**DELETE /api/v1/admin/zones/:code**
- **Auth**: Admin only
- **Response**: Soft delete (isActive=false)

---

## Pricing Strategy

### Credit Pricing (Hypothetical)
- 100 credits = $0.99 USD
- 500 credits = $3.99 USD (20% discount)
- 1000 credits = $6.99 USD (30% discount)

### Zone Pricing Examples
- Small zone (5-10 POIs): 10 credits
- Medium zone (10-20 POIs): 20 credits
- Large zone (20+ POIs): 50 credits

### Premium Subscription
- Monthly: $4.99 USD (50 credits included)
- Yearly: $49.99 USD (600 credits included, 2 months free)

**Note**: Real currency transactions not implemented in MVP (credit system only)

---

## Data Consistency

### Zone ↔ POI Sync Issue
- **Problem**: Zone.poiCodes and Poi.zoneCode can become inconsistent
- **Cause**: No foreign key constraint (denormalized design)
- **Mitigation**: Admin UI should update both when modifying zone membership
- **Future**: Background job to detect and fix inconsistencies

### Credit Balance Integrity
- **Problem**: Balance can drift if transactions are not atomic
- **Mitigation**: Use MongoDB transactions for purchase flow
- **Verification**: Periodic audit job compares User.creditBalance with sum of CreditTransaction

---

## Related Documentation

- [User Management ERD](erd_user_auth.md) - User → Subscription relationship
- [POI Core ERD](erd_poi_core.md) - POI → Zone relationship
- [Backend Subscription Flow](../../03-subscription.md) - Detailed subscription logic
