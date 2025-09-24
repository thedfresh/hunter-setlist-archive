# Copilot Context — Hunter Setlist Archive

## Project Goals
- Build Robert Hunter setlist archive with full CRUD admin interface and public search/browse.
- Capture events, sets, performances, musicians, venues, recordings, notes, tags.
- Support uncertainty (`true|false|null`) and partial dates.
- Parsing pipeline (Node.js + local LLM) is **separate**; admin UI only handles clean structured data.

## Tech Stack
- Next.js App Router (`app/`) with TypeScript
- Prisma ORM with PostgreSQL database
- API routes for CRUD operations (`/app/api/`)
- Zod for validation
- Tailwind CSS for styling

## Coding Standards
- TypeScript strict mode
- Prisma for all database operations
- Zod validation on all forms
- API routes follow RESTful patterns
- All forms use proper error handling and validation

## UI Patterns
- Page routes: `/admin/{entity}` → list; `/new`, `/[id]` view
- API routes: `/api/{entity}` → GET (list), POST (create), PUT (update), DELETE
- Tri-state inputs for uncertain booleans (true/false/null)
- Default sorts: musicians/venues alphabetically, events chronologically desc
- Consistent Tailwind styling across all admin pages

## Database Schema
- See `prisma/schema.prisma` for complete model definitions
- Key relationships: Events → Sets → Performances
- Multi-level musician tracking (event-level and performance-level)
- Three-state logic for uncertain data throughout

## Examples
- Musicians CRUD interface is the canonical pattern with relationship management
- Copy this pattern for new entities: list page, create page, edit page, API routes

## Anti-Goals
- Don't design parsing pipeline here
- Don't bypass Prisma ORM
- Don't skip validation with Zod