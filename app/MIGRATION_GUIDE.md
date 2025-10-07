# Database Migration Guide: SQLite to PostgreSQL

This guide explains how to migrate your Violet & Olive application from SQLite (development) to PostgreSQL (production).

## Why Migrate to PostgreSQL?

- **Production Ready**: PostgreSQL is more robust for production workloads
- **Better Performance**: Handles concurrent connections better than SQLite
- **Advanced Features**: Supports complex queries, JSON fields, and advanced indexing
- **Scalability**: Easier to scale horizontally with read replicas
- **Managed Services**: Easy integration with cloud providers (Vercel, Railway, Supabase, etc.)

## Migration Options

### Option 1: Vercel Postgres (Recommended for Vercel Deployments)

1. **Set up Vercel Postgres**
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project (if not already linked)
   vercel link

   # Create Postgres database
   vercel postgres create
   ```

2. **Get your database URL**
   - Go to your Vercel dashboard
   - Navigate to your project > Storage > Postgres
   - Copy the `DATABASE_URL`

### Option 2: Railway PostgreSQL

1. **Set up Railway PostgreSQL**
   - Go to [railway.app](https://railway.app)
   - Create a new PostgreSQL service
   - Copy the `DATABASE_URL` from Railway dashboard

### Option 3: Supabase (Free Tier Available)

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings > Database > Connection string
   - Copy the connection string

2. **Update the connection string format**
   ```bash
   # Supabase provides a pooled connection string, but Prisma needs a direct connection
   # Replace the connection string with your direct database URL from Supabase dashboard
   DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
   ```

### Option 4: Neon (Free PostgreSQL as a Service)

1. **Create Neon database**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

## Migration Steps

### Step 1: Update Environment Variables

1. **Update your `.env.local` file**
   ```bash
   cp .env.example .env.local
   ```

2. **Replace the DATABASE_URL with your PostgreSQL connection string**
   ```env
   DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

### Step 2: Update Prisma Schema

The Prisma schema has already been updated to use PostgreSQL. If you're starting fresh:

```bash
# Generate Prisma client for PostgreSQL
npm run db:generate
```

### Step 3: Run Database Migration

```bash
# Deploy migrations to PostgreSQL (creates tables)
npm run db:setup-postgres
```

This command will:
- Generate the Prisma client
- Apply all migrations to PostgreSQL
- Seed the database with initial data

### Step 4: Migrate Existing Data (If Applicable)

If you have existing data in SQLite that you want to migrate:

```bash
# Run the migration script
npm run db:migrate-to-postgres
```

## Environment-Specific Setup

### Development Environment

For local development, you can continue using SQLite:

```env
DATABASE_URL="file:./dev.db"
```

### Production Environment

For production deployments, use PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
```

## Deployment Considerations

### Vercel Deployment

1. **Set environment variables in Vercel dashboard**
   - Go to your project in Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add your PostgreSQL `DATABASE_URL`

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Railway Deployment

1. **Set DATABASE_URL in Railway**
   - The DATABASE_URL should already be set if you created the PostgreSQL service

2. **Deploy**
   ```bash
   # Railway auto-deploys when you push to Git
   git push origin main
   ```

### Docker Deployment

Update your `docker-compose.yml` or environment variables:

```yaml
services:
  app:
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/violetolive

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=violetolive
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
```

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Verify your DATABASE_URL is correct
   - Check if your PostgreSQL service is running
   - Ensure firewall rules allow the connection

2. **Authentication failed**
   - Double-check username and password in DATABASE_URL
   - Ensure the database user has the required permissions

3. **Migration errors**
   - Run `npx prisma migrate reset` to reset and reapply migrations
   - Check Prisma logs for detailed error information

4. **SSL connection errors**
   - For some cloud providers, you may need to add `?sslmode=require` to your DATABASE_URL
   - Example: `DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"`

### Logs and Debugging

```bash
# Check Prisma logs
npx prisma generate --schema=./prisma/schema.prisma

# View database connection
npx prisma studio

# Reset database (CAUTION: This will delete all data)
npx prisma migrate reset
```

## Post-Migration Checklist

- [ ] Database connection is working
- [ ] All tables have been created
- [ ] Initial data has been seeded
- [ ] User registration works
- [ ] Authentication works
- [ ] All API endpoints work
- [ ] Application starts without errors

## Performance Optimization

For production PostgreSQL databases, consider:

1. **Connection pooling**
   ```bash
   # For Vercel, use built-in connection pooling
   # For other providers, consider pgBouncer
   ```

2. **Indexes** (Prisma creates these automatically based on your schema)

3. **Query optimization**
   - Use `include` and `select` judiciously in Prisma queries
   - Consider pagination for large datasets

## Backup Strategy

1. **Automated backups** (provided by your PostgreSQL hosting service)
2. **Manual backups** before major migrations:
   ```bash
   # Using pg_dump (if you have PostgreSQL client installed)
   pg_dump your_database_url > backup.sql
   ```

## Support

If you encounter issues during migration:

1. Check the [Prisma documentation](https://www.prisma.io/docs/)
2. Review your cloud provider's documentation
3. Check the application logs for detailed error messages
4. Ensure all environment variables are correctly set

## Next Steps

After successful migration:

1. **Deploy to production** with your PostgreSQL database
2. **Monitor performance** and connection usage
3. **Set up monitoring** for your database (if provided by your hosting service)
4. **Consider setting up read replicas** for better performance (for high-traffic applications)