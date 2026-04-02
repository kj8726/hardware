# 🔩 HardwareHub — Setup & Deployment Guide

## Step 1 — Create your `.env.local` file

Copy the example and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in:

```env
MONGODB_URI=          # Your MongoDB Atlas connection string
NEXTAUTH_SECRET=      # Run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=     # From Google Cloud Console
GOOGLE_CLIENT_SECRET= # From Google Cloud Console
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Step 2 — Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set **Authorized redirect URIs**:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://your-app.vercel.app/api/auth/callback/google`
6. Copy **Client ID** and **Client Secret** → paste into `.env.local`

---

## Step 3 — Install & Run

```bash
npm install
npm run dev
```

Open: http://localhost:3000

---

## Step 4 — Create Your Admin Account

1. Open http://localhost:3000/register
2. Register with any email/password
3. Open MongoDB Atlas → your collection → `users`
4. Find your user document and change `role` to `"admin"`
5. Sign out and sign back in
6. You now have admin access at `/dashboard/admin`

---

## Step 5 — Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B: GitHub + Vercel Dashboard
1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com/new
3. Import your repository
4. Add all environment variables from your `.env.local`
5. Set `NEXTAUTH_URL` to your Vercel URL (e.g., `https://hardwarehub.vercel.app`)
6. Deploy ✅

---

## Project Structure

```
hardwarehub/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── auth/register/       # Registration endpoint
│   │   ├── upload/              # Cloudinary image upload
│   │   ├── requests/            # Part requests CRUD
│   │   ├── responses/           # Shop quote responses
│   │   ├── products/            # Marketplace products CRUD
│   │   ├── shops/               # Shop registration
│   │   ├── reviews/             # Shop reviews
│   │   └── admin/               # Admin endpoints
│   ├── page.js                  # Homepage
│   ├── login/                   # Login page
│   ├── register/                # Register page
│   ├── marketplace/             # Product listings
│   ├── requests/                # Part requests board
│   │   ├── new/                 # Post new request
│   │   └── [id]/                # Request detail + responses
│   ├── products/
│   │   ├── new/                 # Add product (shop owners)
│   │   └── [id]/                # Product detail page
│   └── dashboard/
│       ├── customer/            # Customer dashboard
│       ├── shop/                # Shop owner dashboard
│       └── admin/               # Admin panel
├── components/
│   ├── Navbar.jsx               # Navigation
│   └── Providers.jsx            # NextAuth session provider
├── lib/
│   ├── mongodb.js               # DB connection singleton
│   ├── cloudinary.js            # Cloudinary upload helpers
│   └── auth.js                  # NextAuth config
├── models/
│   ├── User.js
│   ├── Shop.js
│   ├── Request.js
│   ├── Response.js
│   ├── Product.js
│   └── Review.js
├── .env.local.example           # ← Copy this to .env.local
├── next.config.mjs
├── tailwind.config.js
└── vercel.json
```

---

## User Roles

| Role | Can Do |
|------|--------|
| `customer` | Post part requests, browse marketplace, review shops |
| `shop_owner` | All above + respond to requests, list products, register shop |
| `admin` | All above + approve shops, manage users, view all data |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 App Router |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js (Google + Email/Password) |
| Images | Cloudinary |
| Styles | Tailwind CSS (custom industrial theme) |
| Deployment | Vercel (serverless) |
