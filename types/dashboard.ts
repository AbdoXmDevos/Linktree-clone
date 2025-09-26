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