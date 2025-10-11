# Copilot Instructions for Hunter Setlist Archive

## Architecture
- Next.js 14, PostgreSQL via Prisma ORM
- Admin: `app/admin/*` (Basic Auth protected)
- Public: `app/(public)/*`
- API: `app/api/admin/*` (protected), `app/api/*` (public)

## Critical Patterns

### 1. Reusable Libraries - CHECK FIRST
Before writing new code, search these directories:
- `lib/queries/*Queries.ts` - Database queries (event, song, venue, band)
- `lib/formatters/` - Date formatting, display text
- `lib/utils/` - Slugs, sorting, filters, performer styles
- `components/ui/` and `components/ui/events/` - Reusable components

### 2. Design System (globals.css)
**NEVER write inline Tailwind** - use predefined classes:
- Buttons: `btn`, `btn-primary`, `btn-secondary`, `btn-danger`
- Forms: `input`, `textarea`, `select`, `form-label`, `form-error`
- Cards: `card`, `event-card-solo`, `event-card-roadhog`, etc.
- Badges: `badge-verified`, `badge-uncertain`, `badge-sbd`
- States: `loading-state`, `spinner`, `empty-state`

### 3. Cache Handling
- **Admin routes**: Add `revalidatePath('/api/admin/...')` after mutations
- **Public routes**: Add `export const dynamic = 'force-dynamic';` at top

### 4. Query Filtering
Import from `lib/utils/queryFilters.ts`:
- `getBrowsableEventsWhere()` - Browse/detail pages
- `getCountableEventsWhere()` - Event counts
- `getCountablePerformancesWhere()` - Song stats

### 5. Server-Side Only
- All Prisma queries in API routes or server components
- Client components fetch from API routes, never directly from Prisma
- Use `JSON.parse(JSON.stringify(data))` to strip Prisma symbols before returning

## Common Imports
```typescript
// Queries
import { getEventsBrowse } from '@/lib/queries/eventBrowseQueries';
import { getSongWithPerformances } from '@/lib/queries/songQueries';

// Utils
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { generateSlug } from '@/lib/utils/generateSlug';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import { compareDates } from '@/lib/utils/dateSort';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EventCard from '@/components/ui/events/EventCard';