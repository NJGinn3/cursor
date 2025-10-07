# Violet & Olive - BDSM Matching & Gamification Platform

A sophisticated platform for BDSM enthusiasts to connect, explore kinks, and engage in gamified experiences with like-minded individuals.

## Features

- **User Authentication**: Secure sign-up and login with NextAuth.js
- **Kink Matching**: Rate and match based on BDSM preferences
- **Pairing System**: Connect with compatible partners
- **Gamification**: Earn points through habits, rewards, and competitions
- **Real-time Chat**: Communicate with your pairings
- **Community Competitions**: Participate in organized events

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth.js
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js with credentials provider
- **Deployment**: Optimized for Vercel, Railway, or Docker

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd violet-olive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # For development (SQLite)
   npm run db:generate
   npm run db:migrate
   npm run db:seed

   # For production (PostgreSQL) - See Migration Guide
   npm run db:setup-postgres
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Database Migration

### Migrating from SQLite to PostgreSQL

For production deployment, you'll need to migrate from SQLite to PostgreSQL:

1. **Choose your PostgreSQL provider** (see Environment Variables section)
2. **Update your environment variables** with the PostgreSQL DATABASE_URL
3. **Run the migration script**:
   ```bash
   npm run db:migrate-to-postgres
   ```
4. **Deploy with PostgreSQL** (see Deployment section below)

📖 **[Complete Migration Guide](./MIGRATION_GUIDE.md)** - Detailed step-by-step instructions

### Why PostgreSQL for Production?

- Better performance and concurrency handling
- Advanced features like JSON fields and complex queries
- Managed services available (Vercel Postgres, Railway, Supabase, Neon)
- Easier scaling and backup strategies

## Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Finalize for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set up PostgreSQL Database**
   ```bash
   # Create Vercel Postgres database
   vercel postgres create

   # Get your database URL from Vercel dashboard
   # Project > Storage > Postgres > Copy DATABASE_URL
   ```

4. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add the following:
     ```
     DATABASE_URL=your-postgresql-connection-string
     NEXTAUTH_URL=https://your-domain.vercel.app
     NEXTAUTH_SECRET=your-generated-secret
     ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

   Vercel will automatically run Prisma migrations during deployment.

### Option 2: Railway

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Create a new project from GitHub

2. **Add PostgreSQL Database**
   - In Railway dashboard, add a PostgreSQL service
   - Copy the DATABASE_URL from Railway dashboard

3. **Deploy**
   ```bash
   # Railway auto-deploys when you push to Git
   git push origin main
   ```

   Railway will automatically set the DATABASE_URL environment variable.

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://user:password@db:5432/violetolive
         - NEXTAUTH_URL=http://localhost:3000
         - NEXTAUTH_SECRET=your-secret

     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=violetolive
         - POSTGRES_USER=user
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

3. **Set up PostgreSQL**
   ```bash
   # The docker-compose.yml includes PostgreSQL service
   # Wait for PostgreSQL to be ready, then run:
   docker-compose exec app npm run db:setup-postgres
   ```

4. **Deploy**
   ```bash
   docker-compose up -d
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT encryption | Yes |

## Database Schema

The app uses Prisma with the following main models:
- **User**: Authentication and basic profile info
- **Profile**: Extended user profile with BDSM preferences
- **Kink**: Available kinks and activities
- **KinkRating**: User ratings for each kink
- **Pairing**: Connections between users
- **Message**: Chat messages between pairings
- **Habit**: Gamification habits
- **Reward/Punishment**: Gamification elements
- **Competition**: Community events

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.

## Support

For support and questions, please contact the development team.
