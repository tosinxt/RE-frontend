# Firebase setup (MVP)

## Required Auth claims
We rely on Firebase Authentication custom claims for **company scoping** and **roles**:

- `companyId`: string (Firestore `companies/{companyId}`)
- `role`: `"admin"` or `"staff"`

These are used by:
- Firestore Security Rules (see `firebase/firestore.rules`)
- Backend auth guard (verifies token + extracts context)

## Firestore structure
All app data is scoped to a company:

- `companies/{companyId}`
  - `users/{uid}`
  - `documents/{documentId}`
  - `netsheets/{netsheetId}`
  - `templates/{templateId}`
  - `templateVersions/{versionId}`
  - `audit/{eventId}`

## Security rules
Draft rules live in `firebase/firestore.rules`:
- Staff: read company data
- Admin: read audit
- **All writes are backend-only** for MVP (hybrid access pattern)

