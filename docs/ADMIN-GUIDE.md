# Admin UI Guide — Hunter Setlist Archive

## Architecture Pattern
- Frontend: Next.js pages in `/app/admin/`
- Backend: API routes in `/app/api/` 
- Database: Prisma ORM with PostgreSQL
- Validation: Zod schemas on forms
- Styling: Tailwind CSS

## Page Structure
- Layout: Header → Content (ListTable or Form) → Actions
- Routes: `/admin/{entity}` (list), `/admin/{entity}/new` (create), `/admin/{entity}/[id]` (edit)
- API Routes: `/api/{entity}` for CRUD operations

## Form Patterns
- Zod validation with `safeParse()` for client-side validation
- Display inline errors below each field
- API routes handle server-side validation and database operations
- Return structured error responses for form handling

## Data Validation Rules
- Names: trim whitespace, remove trailing punctuation
- Dates: accept partial dates (year/month/day can be null), require `displayDate` for display
- Deduplication: check existing records before creating (especially venues by name/city/state)
- Three-state booleans: render as toggle controls with true/false/null states

## List Pages
- Default sorting: venues/musicians alphabetically, events by date descending
- Include search/filter capabilities
- Show relationships (e.g., musician default instruments, event venues)
- Pagination for large datasets

## Relationship Management
- Many-to-many: Use junction tables (e.g., MusicianDefaultInstrument)
- Foreign keys: Dropdown selects populated from related tables
- Default values: Auto-populate based on relationships (e.g., musician default instruments)

## Complex Data Handling
- **Three-state logic**: true/false/null for uncertain data throughout schema
- **Partial dates**: year/month/day fields can be null, displayDate shows human-readable format
- **Hunter participation**: Track vocals/guitar/harmonica per performance
- **Guest musicians**: Event-level and performance-level tracking

## Error Handling
- API routes return consistent error format
- Forms show validation errors inline
- Success states redirect to appropriate pages
- Handle Prisma constraint violations gracefully

## Database Operations
- All writes use Prisma transactions where appropriate
- Cascade deletes only for child records, never reference data
- Include related data in queries when needed for display
- Use proper Prisma include/select for performance

## Testing Approach
- Form validation with various input combinations
- CRUD operations for each entity type
- Relationship creation and modification
- Error states and edge cases