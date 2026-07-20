---
name: QuickStay database routing
description: MongoDB cluster has two databases; hotel-booking is the real one, test has old seed data
---

## Always specify dbName in mongoose.connect

```javascript
await mongoose.connect(process.env.MONGODB_URI, { dbName: "hotel-booking" });
```

**Why:** The Atlas cluster has at least two databases: `hotel-booking` (real user data — hotels, rooms, bookings) and `test` (stale seed data, not used). Without specifying `dbName`, dotenv defaults vary by context and the app connects to `test`, returning wrong data.

**How to apply:** Any script that uses `mongoose.connect` (including seed.js, migration scripts, and db.js) must include `{ dbName: "hotel-booking" }`. For Render, include the db name in the URI: `mongodb+srv://...@cluster.mongodb.net/hotel-booking`.

## No MONGODB_URI Replit secret
The MONGODB_URI is stored in `server/.env` (gitignored), NOT as a Replit secret. The file still exists on disk; only git-tracking was removed via `git rm --cached`.
