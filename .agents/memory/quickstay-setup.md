---
name: QuickStay project setup
description: Durable decisions and quirks for the QuickStay hotel booking app on Replit
---

## Package installation — always use root node_modules
All npm packages must be installed at the **workspace root**, not inside `server/` or `client/`. Running `npm install` inside `server/` triggers a Replit firewall block on `@clerk/shared` (critical CVE flagged).

**Why:** Node ESM resolution walks up from `server/` to workspace root, so root node_modules works for all services.

**How to apply:** Always use `installLanguagePackages` (CodeExecution callback) at root level.

## Lazy-init pattern required for third-party clients
Stripe and OpenAI clients MUST be created inside handler functions, not at module top-level. The server process starts before secrets are injected; top-level construction throws immediately and crashes the server.

**Why:** Replit secrets are env vars that may not be present when the module first loads.

**How to apply:** Use a `getStripe()` / `getOpenAI()` getter that throws a descriptive error if the key is absent.

## Clerk webhook body parsing
The `/api/clerk` route must use `express.raw({ type: 'application/json' })` BEFORE `express.json()`. Svix HMAC verification requires the original raw bytes; re-serialising a parsed object with `JSON.stringify` changes field ordering and breaks the signature check.

**Why:** Svix verifies an HMAC over the exact bytes sent by Clerk. Any transformation invalidates it.

**How to apply:** In `server/server.js`, mount `express.raw(...)` on the clerk path before the global `express.json()` middleware. In the controller, call `whook.verify(req.body, headers)` (Buffer) then `JSON.parse(req.body)`.

## Auth middleware — User._id IS the Clerk userId
`protect` middleware must use `User.findById(userId)` not `User.findOne({ clerkId: userId })`. The User schema stores the Clerk ID directly as `_id: { type: String }` — there is no `clerkId` field.

**Why:** Using the wrong field means every protected route gets `req.user = null`, silently breaking all authenticated endpoints.

## Payment ownership checks (two layers)
Stripe session creation and verification both enforce that `booking.user === req.auth.userId`. The verify endpoint also cross-checks `session.metadata.bookingId` and `session.metadata.userId` against the Stripe-authoritative session before mutating the booking.

**Why:** Without ownership checks, any authenticated user could mark any booking as paid by supplying an arbitrary bookingId.
