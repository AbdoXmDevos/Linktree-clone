# Design Document

## Overview

The dashboard split-layout feature transforms the existing dashboard into a dual-pane interface optimized for link management and real-time preview. The design leverages the existing Next.js 15, Mantine UI, and Drizzle ORM stack to create an intuitive content management experience with immediate visual feedback.

The left panel serves as a comprehensive link management interface, while the right panel provides a mobile-first preview that updates in real-time as users make changes. This design pattern follows modern content management principles where creators can see immediate results of their actions.

## Architecture

### Component Hierarchy

```
DashboardLayout
├── LeftPanel (Management Interface)
│   ├── LinkManagementHeader
│   ├── AddLinkButton
│   ├── LinkList
│   │   └── LinkItem (repeatable)
│   └── LinkForm (modal/drawer)
└── RightPanel (Preview Interface)
    ├── MobileFrame
    ├── PreviewHeader
    └── LinkCardPreview (repeatable)
```

### State Management Strategy

The design utilizes React's built-in state management with strategic lifting of state to the parent `DashboardLayout` component. This ensures synchronization between the management panel and preview panel without requiring external state management libraries.

**State Structure:**
- `links`: Array of link objects managed at the dashboard level
- `selectedLink`: Currently selected link for editing (null when not editing)
- `isAddingLink`: Boolean flag for add link modal state
- `previewMode`: Current preview mode (mobile/tablet/desktop)

### Data Flow

1. **User Actions** → Management Panel Components
2. **State Updates** → Dashboard Layout State
3. **State Changes** → Preview Panel Re-render
4. **Database Sync** → Server Actions/API Routes

## Components and Interfaces

### Core Interfaces

```typescript
interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  order_index: number;
  created_at: Date;
}

interface LinkFormData {
  title: string;
  url: string;
  description: string;
  icon: string;
}

interface DashboardState {
  links: Link[];
  selectedLink: Link | null;
  isAddingLink: boolean;
  isLoading: boolean;
}
```

### DashboardLayout Component

**Purpose:** Main container component that orchestrates the split-layout interface and manages shared state.

**Key Features:**
- Responsive grid layout using Mantine's Grid system
- State management for links and UI states
- Real-time synchronization between panels
- Loading states and error handling

**Responsive Behavior:**
- Desktop: 50/50 split layout
- Tablet: 60/40 split with collapsible panels
- Mobile: Single panel with tab navigation

### LeftPanel Components

#### LinkManagementHeader
- Dashboard title and user context
- Add link primary action button
- Search/filter functionality for large link collections

#### LinkList
- Scrollable list of existing links
- Drag-and-drop reordering capability
- Quick actions (edit, delete, duplicate)
- Empty state when no links exist

#### LinkItem
- Compact representation of each link
- Title, URL preview, and status indicators
- Click to edit functionality
- Visual feedback for active/selected states

#### LinkForm
- Modal-based form for adding/editing links
- Real-time URL validation
- Icon/image upload with fallback options
- Form validation using Mantine's form utilities

### RightPanel Components

#### MobileFrame
- CSS-based mobile device mockup
- Responsive scaling based on available space
- Device frame styling (iPhone-like appearance)
- Smooth transitions for content updates

#### PreviewHeader
- Profile information display
- Theme preview integration
- Device size toggle options

#### LinkCardPreview
- Accurate representation of public link cards
- Consistent styling with public profile
- Hover states and interaction feedback
- Loading skeletons during updates

## Data Models

### Enhanced Link Model

The existing `links` table schema supports the requirements with minor enhancements:

```sql
-- Existing schema is sufficient, potential additions:
ALTER TABLE links ADD COLUMN description TEXT;
ALTER TABLE links ADD COLUMN is_active BOOLEAN DEFAULT true;
```

### Form Validation Schema

```typescript
const linkFormSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  url: {
    required: true,
    pattern: /^https?:\/\/.+/,
    maxLength: 2000
  },
  description: {
    maxLength: 200
  },
  icon: {
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i
  }
};
```

## Error Handling

### Client-Side Error Handling

**Form Validation Errors:**
- Real-time validation feedback using Mantine's form validation
- Field-level error messages with clear guidance
- Prevention of form submission with invalid data

**Network Errors:**
- Retry mechanisms for failed requests
- Offline state detection and user notification
- Optimistic updates with rollback on failure

**State Synchronization Errors:**
- Automatic refresh of link data on focus
- Conflict resolution for concurrent edits
- User notification for sync failures

### Server-Side Error Handling

**Database Errors:**
- Transaction rollback for failed operations
- Detailed error logging for debugging
- User-friendly error messages

**Validation Errors:**
- Server-side validation as backup to client validation
- Consistent error response format
- Rate limiting for form submissions

## Testing Strategy

### Unit Testing

**Component Testing:**
- Individual component rendering and behavior
- Form validation logic
- State management functions
- Utility functions for URL validation and formatting

**Testing Tools:**
- Jest for test runner
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking

### Integration Testing

**User Flow Testing:**
- Complete add link workflow
- Edit existing link workflow
- Real-time preview updates
- Responsive layout behavior

**Database Integration:**
- CRUD operations for links
- Data consistency checks
- Migration testing

### End-to-End Testing

**Critical User Journeys:**
- New user creating first link
- Power user managing multiple links
- Mobile user experience
- Error recovery scenarios

**Testing Tools:**
- Playwright for E2E testing
- Visual regression testing for preview accuracy

### Performance Testing

**Metrics to Monitor:**
- Initial page load time
- Real-time update latency
- Memory usage with large link collections
- Mobile performance benchmarks

**Optimization Strategies:**
- React.memo for preview components
- Debounced form updates
- Virtual scrolling for large link lists
- Image optimization for icons

## Design Decisions and Rationales

### Split-Layout Choice
**Decision:** Horizontal split with management on left, preview on right
**Rationale:** Follows natural reading patterns and content creation workflows. Users can input on the left and immediately see results on the right.

### Modal vs. Inline Editing
**Decision:** Modal-based form for add/edit operations
**Rationale:** Maintains focus on the editing task while preserving the preview context. Prevents layout shifts that could disrupt the user experience.

### Real-time Updates
**Decision:** Immediate preview updates without explicit save actions
**Rationale:** Provides instant feedback and reduces cognitive load. Users can experiment with changes and see immediate results.

### Mobile-First Preview
**Decision:** Default preview shows mobile layout
**Rationale:** Most link tree traffic comes from mobile devices. Mobile-first design ensures the most common use case is prioritized.

### State Management Approach
**Decision:** React built-in state management instead of external libraries
**Rationale:** The application state is relatively simple and doesn't require complex state management. Built-in solutions reduce bundle size and complexity.

### Responsive Strategy
**Decision:** Adaptive layout with panel collapsing on smaller screens
**Rationale:** Maintains functionality across all device sizes while optimizing for the primary use case on each screen size.