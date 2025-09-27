// Dashboard-specific type definitions
import type { Link as SchemaLink } from '../db/schema';

// Re-export the schema Link type for dashboard use
export type Link = SchemaLink;

// Form data interface for creating/editing links
export interface LinkFormData {
  title: string;
  url: string;
  description: string;
  icon: string;
}

// Dashboard state management interface
export interface DashboardState {
  links: Link[];
  selectedLink: Link | null;
  isAddingLink: boolean;
  isLoading: boolean;
}

// Enhanced dashboard state with error handling
export interface EnhancedDashboardState extends DashboardState {
  error: string | null;
  isSubmitting: boolean;
}

// State management function types
export interface DashboardStateActions {
  setSelectedLink: (link: Link | null) => void;
  setIsAddingLink: (isAdding: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  clearError: () => void;
  addLinkToState: (newLink: Link) => void;
  updateLinkInState: (updatedLink: Link) => void;
  removeLinkFromState: (linkId: string) => void;
}