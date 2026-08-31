# SENTINEL-ID Database Schema Design

## Database Name
`sentinel_id` (Relational SQL Schema)

---

## Core Tables & Entity Relationships

### 1. `users` & `roles`
- `id` (UUID, Primary Key)
- `badge_number` (VARCHAR, Unique)
- `full_name` (VARCHAR)
- `station_id` (VARCHAR)
- `role` (ENUM: `OFFICER`, `SUPERVISOR`, `AUDITOR`, `ADMIN`)
- `password_hash` (VARCHAR, Argon2/Bcrypt)
- `created_at` (TIMESTAMP)

### 2. `screenings`
- `id` (UUID, Primary Key)
- `screening_reference` (VARCHAR, Unique)
- `officer_id` (UUID, Foreign Key)
- `checkpoint_id` (VARCHAR)
- `document_type` (ENUM: `passport`, `visa`, `national_id`, `driving_license`, `border_permit`)
- `traveler_name` (VARCHAR)
- `traveler_nationality` (VARCHAR)
- `traveler_passport_num` (VARCHAR)
- `overall_risk_score` (INT, 0-100)
- `review_priority` (ENUM: `LOW REVIEW PRIORITY`, `REVIEW RECOMMENDED`, `ENHANCED REVIEW RECOMMENDED`)
- `status` (ENUM: `PENDING`, `CLEARED`, `SECONDARY_INSPECTION`, `DETAINED`)
- `processing_time_ms` (INT)
- `created_at` (TIMESTAMP)

### 3. `screening_findings`
- `id` (UUID, Primary Key)
- `screening_id` (UUID, Foreign Key)
- `source_module` (VARCHAR: `OCR`, `MRZ`, `TAMPERING`, `BIOMETRICS`, `WATCHLIST`)
- `finding_code` (VARCHAR)
- `severity` (ENUM: `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `title` (VARCHAR)
- `description` (TEXT)
- `bbox_json` (JSON)
- `evidence_json` (JSON)
- `created_at` (TIMESTAMP)

### 4. `audit_logs` (Hash-Chained Cryptographic Ledger)
- `id` (UUID, Primary Key)
- `sequence_number` (BIGINT, Auto-Increment)
- `actor_id` (VARCHAR)
- `action` (VARCHAR)
- `entity_type` (VARCHAR)
- `entity_id` (VARCHAR)
- `timestamp` (TIMESTAMP)
- `event_payload_json` (JSON)
- `previous_hash` (VARCHAR(64), SHA-256)
- `record_hash` (VARCHAR(64), SHA-256)
