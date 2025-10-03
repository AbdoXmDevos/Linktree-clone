// Dashboard-specific type definitions
import type { 
  Link as SchemaLink, 
  Profile as SchemaProfile,
  Category as SchemaCategory,
  LinkAnalytics as SchemaLinkAnalytics
} from '../db/schema';

// Import validation types
import type {
  LinkFormData as ValidatedLinkFormData,
  ProfileFormData as ValidatedProfileFormData,
  CategoryFormData as ValidatedCategoryFormData,
  BulkOperationData,
  SearchFilterData
} from './validation';

// Re-export the schema types for dashboard use
export type Link = SchemaLink;
export type Profile = SchemaProfile;
export type Category = SchemaCategory;
export type LinkAnalytics = SchemaLinkAnalytics;

// Enhanced link interface with analytics and customization properties
export interface EnhancedLink extends Link {
  analytics?: {
    clicks: number;
    lastClicked?: Date;
    clickTrend: 'up' | 'down' | 'stable';
    weeklyClicks: number;
    monthlyClicks: number;
    conversionRate?: number;
  };
  metadata?: {
    favicon?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    lastMetadataFetch?: Date;
  };
}

// User profile interface with theme and customization options
export interface UserProfile extends Profile {
  theme: 'light' | 'dark' | 'auto';
  customization: {
    primaryColor: string;
    secondaryColor?: string;
    backgroundStyle: 'solid' | 'gradient' | 'image';
    backgroundValue: string;
    fontFamily?: string;
    borderRadius?: number;
    cardStyle?: 'minimal' | 'elevated' | 'outlined' | 'filled';
    animation?: 'none' | 'subtle' | 'smooth' | 'bouncy';
    layout?: 'list' | 'grid' | 'masonry';
  };
  branding?: {
    logo?: string;
    favicon?: string;
    customCss?: string;
    customDomain?: string;
  };
  privacy?: {
    analyticsEnabled: boolean;
    publicProfile: boolean;
    showAnalytics: boolean;
    allowIndexing: boolean;
  };
}

// Analytics data interface for dashboard metrics
export interface AnalyticsData {
  totalClicks: number;
  profileViews: number;
  uniqueVisitors: number;
  totalLinks: number;
  
  // Time-based metrics
  todayClicks: number;
  weeklyClicks: number;
  monthlyClicks: number;
  
  // Performance metrics
  topLinks: Array<{
    linkId: string;
    title: string;
    url: string;
    clicks: number;
    clickRate: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    type: 'click' | 'view' | 'edit' | 'create' | 'delete';
    timestamp: Date;
    details: string;
    linkId?: string;
    linkTitle?: string;
    metadata?: Record<string, any>;
  }>;
  
  // Geographic data
  topCountries: Array<{
    countryCode: string;
    countryName: string;
    clicks: number;
    percentage: number;
  }>;
  
  // Referrer data
  topReferrers: Array<{
    domain: string;
    clicks: number;
    percentage: number;
  }>;
  
  // Time series data for charts
  clicksOverTime: Array<{
    date: string;
    clicks: number;
    views: number;
  }>;
  
  // Performance indicators
  averageClicksPerLink: number;
  clickThroughRate: number;
  bounceRate: number;
}

// Re-export validated form data types
export type LinkFormData = ValidatedLinkFormData;
export type ProfileFormData = ValidatedProfileFormData;
export type CategoryFormData = ValidatedCategoryFormData;

// Form validation error interface
export interface FormValidationError {
  field: string;
  message: string;
  code: string;
}

// Re-export bulk operation and search filter types
export type BulkOperation = BulkOperationData;
export type SearchFilter = SearchFilterData;

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  errors: Array<{
    linkId: string;
    error: string;
  }>;
}

// Dashboard state management interface
export interface DashboardState {
  links: Link[];
  selectedLink: Link | null;
  isAddingLink: boolean;
  isLoading: boolean;
}

// Enhanced dashboard state with advanced features
export interface EnhancedDashboardState extends DashboardState {
  // Core data
  profile: UserProfile | null;
  analytics: AnalyticsData | null;
  categories: Category[];
  
  // UI state
  selectedLinks: string[];
  draggedLink: Link | null;
  previewMode: 'mobile' | 'tablet' | 'desktop';
  sidebarCollapsed: boolean;
  
  // Form state
  activeForm: 'add' | 'edit' | 'bulk' | null;
  formData: LinkFormData;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isLoadingAnalytics: boolean;
  
  // Error handling
  error: string | null;
  errors: Record<string, string>;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
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