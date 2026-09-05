# Urban Furniture — Accounting System

A full-stack double-entry accounting web application for Urban Furniture.

## Architecture

```
urban-furniture-accounting/
├── backend/   → Node.js + Express (TypeScript) + PostgreSQL via Prisma — port 5000
└── frontend/  → React + Vite (TypeScript) + Tailwind CSS — port 5173
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or cloud instance)
- Cloudinary account (for contact image uploads)

## Setup

### 1. Configure Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secrets
```

Required values in `backend/.env`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/urban_furniture?schema=public
JWT_SECRET=your-super-secret-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
# Default: VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Database Migration + Seed

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Seed will print user credentials to console.

### 4. Start Both Servers

```bash
# From repo root (runs both with concurrently):
npm install
npm run dev

# Or run separately:
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Default Users (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@urbanfurniture.com | Admin@123 |
| Accountant | accountant@urbanfurniture.com | Account@123 |
| Contact (Nimesh Pathak) | nimesh@example.com | Contact@123 |

## Tech Stack

### Backend
- Node.js + Express (TypeScript)
- PostgreSQL + Prisma ORM
- JWT authentication + bcryptjs
- Zod validation
- Cloudinary (image uploads)

### Frontend
- React + Vite (TypeScript)
- Tailwind CSS
- React Router v6
- React Query (@tanstack/react-query)
- Axios with JWT interceptor
- React Hook Form + Zod
- Recharts
