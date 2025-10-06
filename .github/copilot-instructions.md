# Copilot Instructions for Hunter Setlist Archive

This document guides AI coding agents to be productive in the Hunter Setlist Archive codebase. Follow these project-specific conventions and workflows for best results.

## Big Picture Architecture
- **Frontend:** Next.js 15 (TypeScript) in `app/` with file-based routing and admin/public separation
- **Database:** PostgreSQL, managed via Prisma ORM (`prisma/schema.prisma`)
- **Styling:** Tailwind CSS (`app/globals.css`, `tailwind.config.js`)
- **Data Model:** Events, Musicians, Songs, Venues, Contributors, Sets, Performances, Tags, Links
- **Admin UI:** All admin pages live under `app/admin/` (e.g., `app/admin/albums/`, `app/admin/events/`)
- **API Routes:** All backend logic is in `app/api/` using Next.js route handlers (RESTful, file-based)
- **Data Import:** Legacy data scripts in `local-data/scripts/` (e.g., `import-hunter-songs.js`)

## Developer Workflows
- **Install:** `npm install`
- **Dev Server:** `npm run dev` (Next.js)
- **Prisma Studio:** `npx prisma studio` (for DB inspection)
- **Database Connection:** Configure `.env` for local PostgreSQL
- **Deployment:** Push to `main` triggers GitHub Actions → PM2 restart on production
- **Schema Updates:** Update `prisma/schema.prisma`, then run `npx prisma migrate dev`
- **Data Import:** Use scripts in `local-data/scripts/` for bulk import

## Project Conventions & Patterns
- **Three-state logic:** Use `true`/`false`/`null` for uncertain data (see schema)
- **RESTful API:** Use Next.js route handlers in `app/api/` for all backend endpoints
- **Admin vs Public:** Admin pages are always under `app/admin/`; public pages are at root or under main entities
- **Component Organization:** Place feature-specific components in `components/` subfolders within entity directories
- **Styling:** Use Tailwind utility classes; global styles in `app/globals.css`

## Schema Changes  
- **Update Schema:** Edit `prisma/schema.prisma` 
- **Apply Changes:** `npx prisma db push` (database not managed by migrations)
- **Update Client:** `npx prisma generate`

## Current Data Model
- **Links System:** Direct foreign keys (eventId, songId, venueId, recordingId) rather than polymorphic
- **Components:** Large components extracted (PerformanceForm, SetPerformancesSection, etc.)
- **Component Size Limit:** Maximum 500 lines per component

## Component Rules
- Maximum 500 lines per component
- Extract components when approaching 400 lines  
- Create separate components for create vs edit workflows
- Use lib/types.ts for shared type definitions

## Key Files & Directories
- `prisma/schema.prisma`: Main DB schema
- `scripts/reset-database.sql`: Full DB reset script
- `local-data/hunter-songs.yaml`: Source data for import
- `local-data/scripts/`: Data import utilities
- `app/admin/`: Admin UI and CRUD
- `app/api/`: Backend API routes
- `README.md`: Project overview and setup

## Proven Working Patterns
- EventContributorsEditor: for editing existing events
- EventContributorsInput: for event creation (no eventId, local state only)
- PerformanceForm: extracted modal component for performance creation/editing
- SetPerformancesSection: manages performances within a set
- Embedded creation: AddVenueModal, AddSongForm for workflow improvements

## Example Patterns
- **API Route:** `app/api/events/[id]/route.ts` for event details
- **Admin Page:** `app/admin/events/new/page.tsx` for creating new events
- **Component:** `app/admin/events/[id]/components/EventContributorsEditor.tsx` for editing contributors


## Form Validation Pattern
```javascript
function validate() {
  const newErrors = {};
  if (!form.requiredField) newErrors.requiredField = "Error message";
  return newErrors;
}
```

## API Response Pattern  
```javascript
if (res.ok) {
  const data = await res.json();
  // handle success
} else {
  setErrors({ form: "Operation failed" });
}
```

## Component Props Patterns

### Editing Components (entity exists)
```typescript
function EditComponent({ 
  entityId, 
  editingEntity, 
  onClose, 
  onSaved 
}: any) {
  // entityId: required for API calls
  // editingEntity: object when editing, null when creating
  // onClose: required callback
  // onSaved: required callback
}
```

### Creation Components (entity doesn't exist yet)
```typescript
interface Props {
  onDataChange?: (data: EntityType[]) => void;
}
const CreateComponent: React.FC<Props> = ({ onDataChange }) => {
  // No entityId - entity doesn't exist yet
  // Optional callback - parent may not need to track changes
  // Manages local state, calls API for lookups only
}
```

---

If any conventions or workflows are unclear, ask the user for clarification or examples from the codebase before proceeding.
