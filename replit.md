# QuickStay – Hotel Booking Platform

## Project Overview
QuickStay is a full-stack hotel booking web application with:
- **Frontend**: React 19 + Vite + Tailwind CSS v4 (in `client/`)
- **Backend**: Node.js + Express 5 + MongoDB/Mongoose (in `server/`)
- **Auth**: Clerk (webhooks sync users to MongoDB)
- **Payments**: Stripe Checkout (test mode)
- **AI**: OpenAI-powered chatbot + hotel recommendation engine
- **Storage**: Cloudinary (hotel/room images)

## How to Run on Replit

### Backend (port 3000)
```
cd server && node server.js
```
Workflow name: **Start Backend**

### Frontend (port 5000)
```
cd client && npm run dev
```
Workflow name: **Start application**

The Vite dev server proxies all `/api/*` requests to `http://localhost:3000`, so both services are visible through the single preview pane on port 5000.

## Deploying to Render

1. Push code to GitHub
2. Create a new **Web Service** on Render, connect your GitHub repo
3. Set **Build Command**: `npm install && cd client && npx vite build`
4. Set **Start Command**: `NODE_ENV=production node server/server.js`
5. Add all environment variables listed in `render.yaml` → **Environment** tab
   - Set `MONGODB_URI` to include the database name: `...mongodb.net/hotel-booking`
   - Set `CLIENT_URL` to your Render app URL (e.g. `https://quickstay.onrender.com`)
   - Set `CLERK_WEBHOOK_SECRET` and update the webhook URL in Clerk dashboard → your Render URL + `/api/clerk`
6. Deploy — Express serves both the API and the built Vite frontend

## Required Environment Variables

### Already configured (in server/.env — DO NOT commit this file)
- `MONGODB_URI` — MongoDB Atlas connection string (append `/hotel-booking` to specify the correct DB)
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SENDER_EMAIL`, `SMTP_USER`, `SMTP_PASS`

### Must be added as Replit Secrets for full feature support
| Key | Description |
|-----|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `OPENAI_API_KEY` | OpenAI API key — required for AI chatbot & recommendations |

### Non-secret env vars (already set in Replit)
| Key | Value |
|-----|-------|
| `CLIENT_URL` | Replit preview URL — used by Stripe for redirect after payment |
| `NODE_ENV` | `development` |
| `VITE_CURRENCY` | `$` |

## Security Features Added
- **Helmet** — security HTTP headers on all responses
- **Rate limiting** — 200 req/15 min general, 20 req/15 min for AI endpoints
- **express-mongo-sanitize** — strips `$` and `.` operators from inputs (NoSQL injection protection)
- **Input validation** — all controllers validate and whitelist user inputs
- **File upload protection** — JPEG/PNG/WebP only, 5 MB limit, extension double-check
- **Auth auto-sync** — `protect` middleware auto-creates users from Clerk if webhook missed
- **Ownership checks** — Stripe payments verified server-side; room toggle checks hotel ownership

## Database
- **MongoDB Atlas** — cluster `cluster0.ys9dynm.mongodb.net`
- **Database name**: `hotel-booking`
- The `db.js` config passes `{ dbName: "hotel-booking" }` to ensure the correct database is used
- Sample data: run `cd server && node seed.js` to populate 4 hotels × 14 rooms

## Bug Fixes Applied
| Area | Bug | Fix |
|------|-----|-----|
| AI chatbot | "Network error" — axios was pointing to old Vercel URL | Hardcoded `baseURL = ''` in AppContext so all requests use Vite proxy / relative URLs |
| 401 errors | Clerk users not found in MongoDB (webhook not configured) | `protect` middleware auto-creates user from Clerk API on first request |
| Hotel listings | Only 1 room showing — nested populate crashed without User schema loaded | All models registered at server startup; seed script fixed to target `hotel-booking` DB |
| Dashboard | `item.user.username` undefined — field is `name` | Fixed to `item.user?.name` |
| Dashboard | `toast` not in AppContext | Added direct `import toast from 'react-hot-toast'` |
| Server | `req.auth` could be undefined causing crash | Added null guard before destructuring |

## Project Structure
```
quickstay/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, Footer, AIChatbot, AIRecommendations…)
│   │   ├── context/         # AppContext — global state (user, rooms, auth)
│   │   ├── pages/           # Route pages (Home, AllRooms, RoomDetails, MyBookings…)
│   │   └── assets/          # SVGs, images, static data
│   └── vite.config.js       # Vite config with Replit proxy + allowedHosts
├── server/                  # Express backend
│   ├── configs/             # DB (hotel-booking), Cloudinary, Nodemailer setup
│   ├── controllers/         # Route handlers (booking, payment, AI, user, hotel, room)
│   ├── middleware/           # Auth (protect w/ Clerk auto-sync), file upload
│   ├── models/              # Mongoose schemas (User, Hotel, Room, Booking)
│   ├── routes/              # Express routers
│   └── seed.js              # Sample data seeder (4 hotels, 14 rooms)
└── render.yaml              # Render deployment config
```

## User Preferences
- Keep code clean and well-commented so changes are easy to understand
- New features should go in clearly separated files
- Prefer small, focused files over large monolithic ones
