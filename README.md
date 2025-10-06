# cursor

## Deploying the app (`app/`)

- Environment variables:
  - `DATABASE_URL` (SQLite path or remote DB)
  - `NEXTAUTH_SECRET` (required in production)
  - `NEXTAUTH_URL` (public URL)

- Local dev:
  - Create `app/.env` from `app/.env.example`
  - `npm ci --prefix app`
  - `npx --prefix app prisma migrate dev`
  - `npm run --prefix app dev`

- Production build:
  - `npm run --prefix app build`
  - `npm run --prefix app start`

- Docker:
  - Build: `docker build -t violet-olive ./app`
  - Run: `docker run -e DATABASE_URL=... -e NEXTAUTH_SECRET=... -p 3000:3000 violet-olive`