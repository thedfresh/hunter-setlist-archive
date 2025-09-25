# Copilot Context — Hunter Setlist Archive

# Copilot Instructions - Hunter Archive

## Component Rules
- Maximum 500 lines per component
- Extract components when approaching 400 lines  
- Create separate components for create vs edit workflows
- Use lib/types.ts for shared type definitions

## Code Patterns
- Admin routes: /admin/{entity} (list), /admin/{entity}/new (create), /admin/{entity}/[id] (edit)
- API routes: /api/{entity} (GET list, POST create), /api/{entity}/[id] (GET single, PUT update, DELETE)
- Use Prisma for all database operations
- Use manual form validation with error state objects
- Three-state booleans: true/false/null for uncertain data
- Tailwind CSS for all styling

## Database Schema Key Points
- Events contain Sets contain Performances (hierarchy)
- Hunter participation: hunterVocal, hunterGuitar, hunterHarmonica (per performance)
- Notes fields: direct TEXT fields on each entity (not polymorphic)
- Flexible dates: year/month/day can be null, displayDate for human display

## Proven Working Patterns
- EventContributorsEditor: for editing existing events
- EventContributorsInput: for event creation (no eventId, local state only)
- PerformanceForm: extracted modal component for performance creation/editing
- SetPerformancesSection: manages performances within a set
- Embedded creation: AddVenueModal, AddSongForm for workflow improvements

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