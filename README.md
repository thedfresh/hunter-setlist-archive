# Hunter Setlist Archive

A modern Next.js application for browsing and searching Robert Hunter's complete performance history.

## Project Status: Complete Reset & Rebuild

**Current Phase:** Fresh rebuild with v2.0 database schema  
**Last Reset:** September 22, 2025  
**Database:** PostgreSQL with complete v2.0 schema implemented  

This project migrates a 20-year-old static HTML Robert Hunter setlist website to a modern, searchable database-driven application.

## Database Schema v2.0

The database has been completely reset and rebuilt with a comprehensive v2.0 schema featuring:

- **Events table**: Complete show tracking with flexible date handling
- **Multi-level musician tracking**: Event-level and performance-level guest musicians
- **Hunter participation tracking**: Detailed vocals/guitar/harmonica participation per song
- **Recording information**: Multiple recordings per event with contributor tracking
- **Flexible annotation system**: Reusable footnotes linked to events/sets/performances
- **Three-state logic**: true/false/null throughout for uncertain data

## Tech Stack

- **Frontend:** Next.js 15 with TypeScript
- **Database:** PostgreSQL with Prisma ORM (to be configured)
- **Styling:** Tailwind CSS
- **Hosting:** DigitalOcean droplet with automated deployment
- **Deployment:** GitHub Actions → PM2 restart

## Infrastructure

- **Production:** https://stillunsung.com (https://darkstarcrashes.com redirects)
- **Server:** Ubuntu 24.10, 1GB RAM, SSL with Let's Encrypt
- **Database:** PostgreSQL with v2.0 schema
- **Local Development:** Separate PostgreSQL database

## Development Setup

```bash
# Install dependencies
npm install

# Set up local database connection
# Update .env with your local PostgreSQL connection

# Start development server
npm run dev
```

## Deployment

Automatic deployment via GitHub Actions:
- Push to `main` branch triggers build and deployment
- PM2 handles process management on production server
- Environment variables managed via `.env.production` on server

## Next Steps

1. Configure Prisma with v2.0 schema
2. Build basic Next.js app structure
3. Implement data import pipeline
4. Create admin interface for data management
5. Build public search and browse interface

## Database Reset

The complete v2.0 database schema is available in `scripts/reset-database.sql` and can be applied to fresh PostgreSQL instances.

---

*This is a complete rebuild of the legacy Hunter Archive with modern tooling and comprehensive data modeling.*