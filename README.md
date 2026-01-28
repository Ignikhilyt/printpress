# PrintPress

Premium study notes printing e-commerce platform.

## Project Structure

- `client/` - React frontend (Vite + TailwindCSS)
- `server/` - Node.js backend (Express + Prisma + PostgreSQL)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend
```bash
cd server
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Login Credentials
- Email: `admin@printpress.com`
- Password: `Admin123456`

## Deployment
- Frontend: Vercel
- Backend: Railway
- Database: Neon PostgreSQL
