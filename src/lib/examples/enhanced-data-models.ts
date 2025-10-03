// Examples demonstrating the enhanced data models and TypeScript interfaces
import type {
  EnhancedLink,
  UserProfile,
  AnalyticsData,
  LinkFormData,
  ProfileFormData,
  BulkOperation,
  SearchFilter
} from '../../../types/dashboard';

import {
  validateLinkFormData,
  validateProfileFormData,
  isValidUrl,
  normalizeUrl,
  isValidUsername,
  suggestUsername,
  normalizeHexColor,
  getContrastColor,
  normalizeTags
} from '../utils/validation';

// Example: Enhanced Link with analytics and customization
export const exampleEnhancedLink: EnhancedLink = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  profile_id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'My Portfolio Website',
  url: 'https://johndoe.dev',
  description: 'Check out my latest projects and blog posts',
  order_index: 1,
  icon: 'globe',
  category: 'professional',
  tags: ['portfolio', 'web-development', 'projects'],
  custom_styling: {
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#1D4ED8',
    borderWidth: 2,
    fontSize: 16,
    fontWeight: 'bold',
    shadow: true,
    gradient: {
      from: '#3B82F6',
      to: '#1D4ED8',
      direction: 'horizontal'
    }
  },
  is_featured: true,
  created_at: new Date('2024-01-15T10:30:00Z'),
  
  // Enhanced analytics data
  analytics: {
    clicks: 1250,
    lastClicked: new Date('2024-01-20T14:22:00Z'),
    clickTrend: 'up',
    weeklyClicks: 85,
    monthlyClicks: 320,
    conversionRate: 0.15
  },
  
  // Metadata from URL fetching
  metadata: {
    favicon: 'https://johndoe.dev/favicon.ico',
    ogImage: 'https://johndoe.dev/og-image.jpg',
    ogTitle: 'John Doe - Full Stack Developer',
    ogDescription: 'Experienced developer specializing in React, Node.js, and cloud architecture',
    lastMetadataFetch: new Date('2024-01-15T10:35:00Z')
  }
};

// Example: User Profile with comprehensive customization
export const exampleUserProfile: UserProfile = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  user_id: 'user_123456789',
  username: 'johndoe',
  display_name: 'John Doe',
  bio: 'Full-stack developer passionate about creating amazing user experiences. Currently building the next generation of web applications.',
  avatar_url: 'https://example.com/avatars/johndoe.jpg',
  theme_id: null,
  theme: 'dark',
  analytics_enabled: true,
  created_at: new Date('2024-01-01T00:00:00Z'),
  
  // Enhanced customization options
  customization: {
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    backgroundStyle: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Inter',
    borderRadius: 12,
    cardStyle: 'elevated',
    animation: 'smooth',
    layout: 'list'
  },
  
  // Branding options
  branding: {
    logo: 'https://example.com/logos/johndoe-logo.svg',
    favicon: 'https://example.com/favicons/johndoe.ico',
    customCss: `
      .custom-link-card {
        transition: transform 0.2s ease;
      }
      .custom-link-card:hover {
        transform: translateY(-2px);
      }
    `,
    customDomain: 'johndoe.dev'
  },
  
  // Privacy settings
  privacy: {
    analyticsEnabled: true,
    publicProfile: true,
    showAnalytics: false,
    allowIndexing: true
  }
};

// Example: Comprehensive Analytics Data
export const exampleAnalyticsData: AnalyticsData = {
  totalClicks: 15420,
  profileViews: 8750,
  uniqueVisitors: 6200,
  totalLinks: 12,
  
  // Time-based metrics
  todayClicks: 45,
  weeklyClicks: 320,
  monthlyClicks: 1250,
  
  // Top performing links
  topLinks: [
    {
      linkId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'My Portfolio Website',
      url: 'https://johndoe.dev',
      clicks: 3200,
      clickRate: 0.21,
      trend: 'up'
    },
    {
      linkId: '550e8400-e29b-41d4-a716-446655440002',
      title: 'GitHub Profile',
      url: 'https://github.com/johndoe',
      clicks: 2800,
      clickRate: 0.18,
      trend: 'stable'
    },
    {
      linkId: '550e8400-e29b-41d4-a716-446655440003',
      title: 'LinkedIn Profile',
      url: 'https://linkedin.com/in/johndoe',
      clicks: 2100,
      clickRate: 0.14,
      trend: 'down'
    }
  ],
  
  // Recent activity
  recentActivity: [
    {
      id: 'activity_001',
      type: 'click',
      timestamp: new Date('2024-01-20T14:22:00Z'),
      details: 'Link clicked: My Portfolio Website',
      linkId: '550e8400-e29b-41d4-a716-446655440000',
      linkTitle: 'My Portfolio Website',
      metadata: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: 'https://twitter.com'
      }
    },
    {
      id: 'activity_002',
      type: 'view',
      timestamp: new Date('2024-01-20T14:15:00Z'),
      details: 'Profile viewed',
      metadata: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        referrer: 'direct'
      }
    }
  ],
  
  // Geographic data
  topCountries: [
    { countryCode: 'US', countryName: 'United States', clicks: 6200, percentage: 40.2 },
    { countryCode: 'GB', countryName: 'United Kingdom', clicks: 2100, percentage: 13.6 },
    { countryCode: 'CA', countryName: 'Canada', clicks: 1800, percentage: 11.7 },
    { countryCode: 'DE', countryName: 'Germany', clicks: 1200, percentage: 7.8 },
    { countryCode: 'FR', countryName: 'France', clicks: 950, percentage: 6.2 }
  ],
  
  // Referrer data
  topReferrers: [
    { domain: 'twitter.com', clicks: 4200, percentage: 27.2 },
    { domain: 'linkedin.com', clicks: 3100, percentage: 20.1 },
    { domain: 'direct', clicks: 2800, percentage: 18.2 },
    { domain: 'github.com', clicks: 1900, percentage: 12.3 },
    { domain: 'google.com', clicks: 1500, percentage: 9.7 }
  ],
  
  // Time series data for charts
  clicksOverTime: [
    { date: '2024-01-14', clicks: 85, views: 120 },
    { date: '2024-01-15', clicks: 92, views: 135 },
    { date: '2024-01-16', clicks: 78, views: 110 },
    { date: '2024-01-17', clicks: 105, views: 150 },
    { date: '2024-01-18', clicks: 88, views: 125 },
    { date: '2024-01-19', clicks: 95, views: 140 },
    { date: '2024-01-20', clicks: 102, views: 145 }
  ],
  
  // Performance indicators
  averageClicksPerLink: 1285,
  clickThroughRate: 0.176,
  bounceRate: 0.32
};

// Example: Form Data Validation Usage
export function demonstrateFormValidation() {
  // Example link form data
  const linkFormData: LinkFormData = {
    title: 'My New Project',
    url: 'https://mynewproject.com',
    description: 'An innovative web application built with modern technologies',
    icon: 'rocket',
    category: 'projects',
    tags: ['web-app', 'react', 'typescript'],
    customStyling: {
      backgroundColor: normalizeHexColor('3B82F6'),
      textColor: getContrastColor('#3B82F6'),
      borderRadius: 8,
      shadow: true
    },
    isFeatured: false
  };
  
  // Validate the form data
  const linkValidation = validateLinkFormData(linkFormData);
  if (linkValidation.success) {
    console.log('Link form is valid:', linkValidation.data);
  } else {
    console.log('Link form errors:', linkValidation.errors);
  }
  
  // Example profile form data
  const profileFormData: ProfileFormData = {
    displayName: 'Jane Smith',
    bio: 'UX Designer with a passion for creating intuitive and beautiful interfaces',
    username: suggestUsername('Jane Smith'),
    theme: 'light',
    customization: {
      primaryColor: '#8B5CF6',
      backgroundStyle: 'solid',
      backgroundValue: '#F8FAFC',
      borderRadius: 12,
      cardStyle: 'minimal',
      animation: 'subtle',
      layout: 'grid'
    },
    privacy: {
      analyticsEnabled: true,
      publicProfile: true,
      showAnalytics: false,
      allowIndexing: true
    }
  };
  
  // Validate the profile form data
  const profileValidation = validateProfileFormData(profileFormData);
  if (profileValidation.success) {
    console.log('Profile form is valid:', profileValidation.data);
  } else {
    console.log('Profile form errors:', profileValidation.errors);
  }
}

// Example: Bulk Operations
export const exampleBulkOperations: BulkOperation[] = [
  // Bulk delete operation
  {
    type: 'delete',
    linkIds: [
      '550e8400-e29b-41d4-a716-446655440004',
      '550e8400-e29b-41d4-a716-446655440005'
    ]
  },
  
  // Bulk categorize operation
  {
    type: 'categorize',
    linkIds: [
      '550e8400-e29b-41d4-a716-446655440006',
      '550e8400-e29b-41d4-a716-446655440007'
    ],
    data: {
      category: 'social-media'
    }
  },
  
  // Bulk styling operation
  {
    type: 'style',
    linkIds: [
      '550e8400-e29b-41d4-a716-446655440008',
      '550e8400-e29b-41d4-a716-446655440009'
    ],
    data: {
      customStyling: {
        backgroundColor: '#10B981',
        textColor: '#FFFFFF',
        borderRadius: 16
      }
    }
  }
];

// Example: Search and Filter
export const exampleSearchFilter: SearchFilter = {
  query: 'portfolio',
  categories: ['professional', 'projects'],
  tags: ['web-development', 'design'],
  sortBy: 'clicks',
  sortOrder: 'desc',
  featured: true,
  dateRange: {
    from: new Date('2024-01-01'),
    to: new Date('2024-01-31')
  }
};

// Example: Utility Functions Usage
export function demonstrateUtilityFunctions() {
  // URL utilities
  const rawUrl = 'example.com/page';
  const normalizedUrl = normalizeUrl(rawUrl);
  const isValid = isValidUrl(normalizedUrl);
  console.log(`URL: ${rawUrl} -> ${normalizedUrl} (valid: ${isValid})`);
  
  // Username utilities
  const displayName = 'John Doe Jr.';
  const suggestedUsername = suggestUsername(displayName);
  const isUsernameValid = isValidUsername(suggestedUsername);
  console.log(`Display name: ${displayName} -> ${suggestedUsername} (valid: ${isUsernameValid})`);
  
  // Color utilities
  const color = '3b82f6';
  const normalizedColor = normalizeHexColor(color);
  const contrastColor = getContrastColor(normalizedColor);
  console.log(`Color: ${color} -> ${normalizedColor} (contrast: ${contrastColor})`);
  
  // Tag utilities
  const rawTags = ['  Web Dev  ', 'REACT', 'web dev', 'TypeScript', ''];
  const normalizedTags = normalizeTags(rawTags);
  console.log(`Tags: ${rawTags} -> ${normalizedTags}`);
}

// Export all examples for use in documentation or testing
export {
  exampleEnhancedLink,
  exampleUserProfile,
  exampleAnalyticsData,
  exampleBulkOperations,
  exampleSearchFilter
};