# Hunter Setlist Archive

A modern Next.js application for archiving and searching Robert Hunter's complete performance history, featuring comprehensive admin interfaces and detailed show documentation.

## Project Status: Active Development

**Current Phase:** Complete admin interface with advanced features  
**Database:** PostgreSQL with comprehensive schema  
**Admin System:** Full CRUD interfaces for all entities

This project modernizes a 20-year-old static HTML Robert Hunter setlist website into a searchable, database-driven archive with sophisticated data management capabilities.

## Features

### Admin Interface
- **Complete event management** with sets, performances, and musical notation
- **Musician tracking** with instrument assignments and guest appearances
- **Venue and song management** with uncertainty tracking
- **Contributor attribution** for recordings and data sources
- **Links system** for external resources (lyrics, videos, recordings)
- **Embedded creation workflows** for efficient data entry

### Data Model
- **Events → Sets → Performances** hierarchical structure
- **Multi-level guest tracking** (event-level and performance-level musicians)
- **Hunter participation tracking** (vocals/guitar/harmonica per song)
- **Three-state logic** (true/false/null) for uncertain historical data
- **Flexible date handling** supporting partial dates and display formatting
- **Recording documentation** with technical details and contributor attribution

## Tech Stack

- **Frontend:** Next.js 15 with TypeScript and Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Admin UI:** Complete CRUD interfaces with component-based architecture
- **Hosting:** DigitalOcean with automated GitHub Actions deployment
- **Process Management:** PM2 with automatic restarts

## Quick Start

```bash
# Clone and install
git clone [repository]
npm install

# Set up local database
# Configure .env with PostgreSQL connection

# Apply database schema
npx prisma db push
npx prisma generate

# Start development server
npm run dev

# Open Prisma Studio (optional)
npx prisma studio
```

## Architecture

- **Admin Routes:** `/admin/{entity}` for data management
- **API Routes:** `/api/{entity}` for RESTful operations
- **Components:** Modular design with size limits for maintainability
- **Database:** Direct foreign key relationships for simplicity

## Deployment

Automatic deployment pipeline:
- Push to `main` branch triggers GitHub Actions
- Automated build and deployment to production
- PM2 handles process management and restarts

## Production

- **Live Site:** https://stillunsung.com
- **Redirect:** https://darkstarcrashes.com → https://stillunsung.com
- **Infrastructure:** Ubuntu server with SSL (Let's Encrypt)

## Development Notes

- Database not managed by migrations - use `npx prisma db push`
- Component size limit: 500 lines (extract when approaching 400)
- Three-state boolean logic throughout schema for uncertain data
- Manual form validation with error state objects

---

*A comprehensive digital archive preserving Robert Hunter's musical legacy through detailed performance documentation and modern search capabilities.*