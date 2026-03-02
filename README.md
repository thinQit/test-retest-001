# Test Retest 001

A simple marketing landing page with a hero section, dynamic features list, and a contact form. Includes backend endpoints to manage features and contact submissions, plus a health check endpoint.

## Features
- Landing page with hero, features, and contact form
- Dynamic features list from `/api/features`
- Contact form submission to `/api/contact`
- Admin dashboard for managing features and contact submissions
- JWT-based admin authentication
- Health endpoint for monitoring

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM (SQLite)
- Tailwind CSS
- Zod validation
- Jest + Playwright testing

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
./install.sh
# or
./install.ps1

npm run dev
```

Open http://localhost:3000

## Environment Variables
Create `.env` from `.env.example` and update as needed:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
SMTP_URL=""
SMTP_USER=""
SMTP_PASS=""
RECAPTCHA_SECRET=""
SENTRY_DSN=""
```

## Project Structure
```
src/app/            # App routes and layouts
src/app/api/        # API handlers
src/components/     # UI and feature components
src/lib/            # Utilities and services
prisma/             # Prisma schema and seed
```

## API Endpoints
- `GET /api/health` — Health check
- `GET /api/features` — List features
- `POST /api/features` — Create feature (admin)
- `PUT /api/features/{id}` — Update feature (admin)
- `DELETE /api/features/{id}` — Delete feature (admin)
- `GET /api/contact` — List contact submissions (admin)
- `POST /api/contact` — Create submission
- `GET /api/contact/{id}` — Get submission (admin)
- `DELETE /api/contact/{id}` — Delete submission (admin)
- `POST /api/auth/login` — Admin login

## Available Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code
- `npm run test` — Run Jest tests
- `npm run test:e2e` — Run Playwright tests

## Testing
- Unit & integration tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Notes
- Seed script creates a default admin user if none exists. Default password: `admin123`.
- Secure admin endpoints by including a Bearer token from `/api/auth/login`.
