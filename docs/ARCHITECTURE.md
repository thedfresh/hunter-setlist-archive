# Hunter Archive — Architecture

## Goals
- Admin: Complete CRUD interface for all entities (events, sets, performances, musicians, venues, recordings, contributors, songs, albums, tags, notes)
- Public: Browse and search interface with filtering; detailed show pages with setlists and recordings
- Data integrity: Handle uncertain data and partial information without losing fidelity

## Technical Stack
- Frontend: Next.js 15 App Router (`app/`), TypeScript, Tailwind CSS
- Backend: PostgreSQL database via Prisma ORM
- API: RESTful routes in `/app/api/` directories
- Validation: Zod schemas for form validation
- Parsing: Separate Node.js pipeline with local LLM (LM Studio Qwen2.5-14B). Not part of admin UI.

## Data Flow
- UI form → Zod validation → API route → Prisma operation → JSON response → UI update
- All database writes use Prisma transactions where appropriate
- Form errors handled via API response validation

## Routing Conventions
- Admin pages: `/admin/{entity}` (list) | `/admin/{entity}/new` (create) | `/admin/{entity}/[id]` (view/edit)
- API routes: `/api/{entity}` (GET list, POST create) | `/api/{entity}/[id]` (GET, PUT, DELETE)
- Entities: event, venue, musician, contributor, song, album, tag, recording, note

## Database Design Principles
- **Three-state booleans**: `true|false|null` for participation and uncertainty flags
- **Flexible dates**: year/month/day fields can be null; `display_date` is source of truth for UI display
- **Auto-generated records**: "Unknown Venue", "Unknown Song" records created when needed
- **Cascade rules**: Child records cascade delete, reference data preserves integrity
- **Multi-level relationships**: Event-level and performance-level musician tracking

## Key Schema Features
- Events contain Sets contain Performances (hierarchical structure)
- Hunter participation tracked per performance (vocals, guitar, harmonica)
- Multiple recordings per event with contributor attribution
- Reusable notes system via junction table linking to events/sets/performances
- Many-to-many relationships: songs↔albums, songs↔tags, musicians↔default instruments

## Development Workflow
- Build entity CRUD interfaces following Musicians pattern
- Use Prisma Studio for database inspection during development
- Test relationship management (especially many-to-many tables)
- Deploy via GitHub Actions to DigitalOcean production environment

## Data Quality Strategy
- Preserve uncertainty rather than forcing false precision
- Support partial information entry with ability to enhance later
- Track data provenance via contributors and verification flags
- Enable manual curation through comprehensive admin interface