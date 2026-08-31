# SENTINEL-ID REST API Reference

## Base URL
`/api/v1`

---

## Authentication Endpoints
- `POST /auth/login` - Authenticate officer credentials and issue JWT tokens
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Retrieve active officer profile, badge, and station

---

## Screening Endpoints
- `POST /screening/analyze` - Upload document image buffer and trigger full OCR + MRZ + Forensic Tampering + Risk pipeline
- `POST /screening/verify-biometric` - Compare document portrait with live passenger capture (1:1 matching + anti-spoofing)
- `GET /screening/stats` - Checkpoint statistics (daily throughput, cleared, secondary, detained)
- `GET /screening/:id` - Retrieve complete screening session, forensic heatmaps, and evidence report
- `POST /screening/:id/review` - Store manual human officer decision, findings confirmation, and notes
- `GET /screening/:id/report` - Export official MHA Forensic Screening Dossier (PDF/JSON)

---

## Watchlist Endpoints
- `GET /watchlist` - Search national & Interpol fugitive database
- `POST /watchlist` - Register new suspect alert / warrant notice
- `DELETE /watchlist/:id` - Remove suspect notice

---

## Audit Ledger Endpoints
- `GET /audit` - Retrieve all immutable hash-chained audit events
- `GET /audit/verify` - Cryptographically verify hash chain integrity (`VERIFIED` vs `TAMPERED`)
- `POST /audit/simulate-tamper` - Test integrity failure for demonstration purposes
