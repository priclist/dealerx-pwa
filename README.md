# DealerX PWA

A full-stack Progressive Web App for commercial vehicle dealerships.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, TypeScript, Tailwind CSS v4, Zustand, Recharts |
| PWA | vite-plugin-pwa, Web App Manifest, Service Worker |
| Backend | Node.js + Express v5, TypeScript |
| Auth | JWT + bcrypt |
| ORM | Prisma v7 |
| Database | Supabase (PostgreSQL) |

## Getting Started

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173

### 2. Backend

```bash
cd server
npm install
# Copy .env.example to .env and fill in your DATABASE_URL
cp .env.example .env
npm run db:push   # Push schema to Supabase
npm run dev
```
Runs at http://localhost:3001

### 3. Supabase Setup

1. Create a project at https://supabase.com
2. Go to Settings → Database → Connection string
3. Copy the URI and paste it into `server/.env` as `DATABASE_URL`
4. Run `npm run db:push` in the server folder

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/vehicles | List vehicles |
| POST | /api/vehicles | Add vehicle |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |
| GET | /api/leads | List leads |
| POST | /api/leads | Create lead |
| PUT | /api/leads/:id | Update lead |
| GET | /api/sales | List sales |
| POST | /api/sales | Record sale |
| GET | /api/customers | List customers |
| POST | /api/customers | Add customer |
| GET | /api/dashboard/stats | Dashboard stats |
| POST | /api/ai/query | AI assistant query |
