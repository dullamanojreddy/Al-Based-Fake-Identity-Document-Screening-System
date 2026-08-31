# SENTINEL-ID Security, Cryptography & Privacy Architecture

## Security Architecture
SENTINEL-ID adheres to defense-in-depth principles across authentication, authorization, data privacy, and cryptographic auditability.

---

## 1. Role-Based Access Control (RBAC)
- **OFFICER:** Create screenings, view active terminal scans, add review notes, trigger e-Gate clearance or secondary flags.
- **SUPERVISOR:** All officer privileges + access analytics, review escalated cases, override risk recommendations with mandatory justification log.
- **AUDITOR:** Read-only access to immutable audit logs, run cryptographic hash chain verification.
- **ADMIN:** User management, system threshold calibration, watchlist registry.

---

## 2. Cryptographic Hash-Chained Audit Ledger
Every administrative or screening action generates a SHA-256 hash-chained block:
$$\text{Record Hash} = \text{SHA-256}(\text{Previous Hash} + \text{Canonical Event JSON} + \text{Timestamp})$$
- The entire chain can be cryptographically verified via `verify_audit_chain()`.
- If any past record is modified or deleted, the downstream hashes break immediately, alerting auditors to tampering.

---

## 3. Data Privacy & Zero-Knowledge Principles
- **No PII in Application Logs:** Document numbers and traveler names are redacted from backend debug logs.
- **Masked Document Numbers:** Document numbers in tables are partially masked (e.g., `Z48****04`) except in authorized individual screening views.
- **Ephemeral Processing:** Uploaded images can be configured for automatic scrubbing after forensic feature extraction.
