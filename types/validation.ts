// Form validation schemas and utilities
import { z } from 'zod';

// URL validation regex that supports various protocols
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;

// Username validation regex (alphanumeric, hyphens, underscores)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// Category/tag validation regex (letters, numbers, spaces, hyphens)
const CATEGORY_REGEX = /^[a-zA-Z0-9\s\-_]+$/;

// Hex color validation regex
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'root', 'support',
  'help', 'about', 'contact', 'privacy', 'terms', 'blog', 'news', 'app',
  'dashboard', 'profile', 'settings', 'login', 'signup', 'register',
  'auth', 'oauth', 'callback', 'webhook', 'analytics', 'stats'
];

// Link form validation schema
export const linkFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  url: z.string()
    .min(1, 'URL is required')
    .regex(URL_REGEX, 'Please enter a valid URL (must start with http:// or https://)')
    .max(2048, 'URL must be less than 2048 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default(''),
  
  icon: z.string()
    .max(100, 'Icon name must be less than 100 characters')
    .optional()
    .default(''),
  
  category: z.string()
    .max(50, 'Category must be less than 50 characters')
    .regex(CATEGORY_REGEX, 'Category can only contain letters, numbers, spaces, and hyphens')
    .optional(),
  
  tags: z.array(z.string()
    .max(30, 'Each tag must be less than 30 characters')
    .regex(CATEGORY_REGEX, 'Tags can only contain letters, numbers, spaces, and hyphens'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  
  customStyling: z.object({
    backgroundColor: z.string()
      .regex(HEX_COLOR_REGEX, 'Background color must be a valid hex color')
      .optional(),
    
    textColor: z.string()
      .regex(HEX_COLOR_REGEX, 'Text color must be a valid hex color')
      .optional(),
    
    borderRadius: z.number()
      .min(0, 'Border radius must be 0 or greater')
      .max(50, 'Border radius must be 50 or less')
      .optional(),
    
    borderColor: z.string()
      .regex(HEX_COLOR_REGEX, 'Border color must be a valid hex color')
      .optional(),
    
    borderWidth: z.number()
      .min(0, 'Border width must be 0 or greater')
      .max(10, 'Border width must be 10 or less')
      .optional(),
    
    fontSize: z.number()
      .min(10, 'Font size must be at least 10px')
      .max(24, 'Font size must be 24px or less')
      .optional(),
    
    fontWeight: z.enum(['normal', 'bold', 'light']).optional(),
    
    shadow: z.boolean().optional(),
    
    gradient: z.object({
      from: z.string().regex(HEX_COLOR_REGEX, 'Gradient from color must be a valid hex color'),
      to: z.string().regex(HEX_COLOR_REGEX, 'Gradient to color must be a valid hex color'),
      direction: z.enum(['horizontal', 'vertical', 'diagonal'])
    }).optional()
  }).optional().default({}),
  
  isFeatured: z.boolean().optional().default(false),
  
  scheduledPublish: z.date().optional(),
  
  expirationDate: z.date().optional()
}).refine((data) => {
  // Ensure expiration date is after scheduled publish date
  if (data.scheduledPublish && data.expirationDate) {
    return data.expirationDate > data.scheduledPublish;
  }
  return true;
}, {
  message: 'Expiration date must be after scheduled publish date',
  path: ['expirationDate']
});

// Profile form validation schema
export const profileFormSchema = z.object({
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .trim(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .default(''),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, hyphens, and underscores')
    .refine((username) => !RESERVED_USERNAMES.includes(username.toLowerCase()), {
      message: 'This username is reserved and cannot be used'
    }),
  
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  
  customization: z.object({
    primaryColor: z.string()
      .regex(HEX_COLOR_REGEX, 'Primary color must be a valid hex color')
      .default('#3B82F6'),
    
    secondaryColor: z.string()
      .regex(HEX_COLOR_REGEX, 'Secondary color must be a valid hex color')
      .optional(),
    
    backgroundStyle: z.enum(['solid', 'gradient', 'image']).default('solid'),
    
    backgroundValue: z.string()
      .min(1, 'Background value is required')
      .max(500, 'Background value must be less than 500 characters')
      .default('#ffffff'),
    
    fontFamily: z.string()
      .max(50, 'Font family must be less than 50 characters')
      .optional(),
    
    borderRadius: z.number()
      .min(0, 'Border radius must be 0 or greater')
      .max(50, 'Border radius must be 50 or less')
      .default(8),
    
    cardStyle: z.enum(['minimal', 'elevated', 'outlined', 'filled']).default('elevated'),
    
    animation: z.enum(['none', 'subtle', 'smooth', 'bouncy']).default('smooth'),
    
    layout: z.enum(['list', 'grid', 'masonry']).default('list')
  }).optional(),
  
  privacy: z.object({
    analyticsEnabled: z.boolean().default(true),
    publicProfile: z.boolean().default(true),
    showAnalytics: z.boolean().default(false),
    allowIndexing: z.boolean().default(true)
  }).optional()
});

// Category form validation schema
export const categoryFormSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .regex(CATEGORY_REGEX, 'Category name can only contain letters, numbers, spaces, and hyphens')
    .trim(),
  
  color: z.string()
    .regex(HEX_COLOR_REGEX, 'Color must be a valid hex color')
    .optional(),
  
  icon: z.string()
    .max(50, 'Icon name must be less than 50 characters')
    .optional(),
  
  orderIndex: z.number()
    .min(0, 'Order index must be 0 or greater')
    .optional()
    .default(0)
});

// Bulk operation validation schema
export const bulkOperationSchema = z.object({
  type: z.enum(['delete', 'categorize', 'reorder', 'style', 'feature']),
  
  linkIds: z.array(z.string())
    .min(1, 'At least one link must be selected')
    .max(100, 'Cannot perform bulk operations on more than 100 links at once'),
  
  data: z.record(z.string(), z.any()).optional()
}).refine((data) => {
  // Validate that required data is provided for specific operation types
  if (data.type === 'categorize' && (!data.data || !data.data.category)) {
    return false;
  }
  if (data.type === 'style' && (!data.data || !data.data.customStyling)) {
    return false;
  }
  if (data.type === 'reorder' && (!data.data || !data.data.orderUpdates)) {
    return false;
  }
  return true;
}, {
  message: 'Required data missing for the selected operation type',
  path: ['data']
});

// Search and filter validation schema
export const searchFilterSchema = z.object({
  query: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  
  categories: z.array(z.string())
    .max(10, 'Cannot filter by more than 10 categories')
    .optional(),
  
  tags: z.array(z.string())
    .max(20, 'Cannot filter by more than 20 tags')
    .optional(),
  
  sortBy: z.enum(['title', 'created_at', 'order_index', 'clicks', 'last_clicked'])
    .default('order_index'),
  
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  
  featured: z.boolean().optional(),
  
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  }).optional().refine((data) => {
    if (data && data.from && data.to) {
      return data.to >= data.from;
    }
    return true;
  }, {
    message: 'End date must be after start date'
  })
});

// Type exports for the validation schemas
export type LinkFormData = z.infer<typeof linkFormSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type BulkOperationData = z.infer<typeof bulkOperationSchema>;
export type SearchFilterData = z.infer<typeof searchFilterSchema>;

// Validation utility functions
export const validateLinkForm = (data: unknown) => {
  return linkFormSchema.safeParse(data);
};

export const validateProfileForm = (data: unknown) => {
  return profileFormSchema.safeParse(data);
};

export const validateCategoryForm = (data: unknown) => {
  return categoryFormSchema.safeParse(data);
};

export const validateBulkOperation = (data: unknown) => {
  return bulkOperationSchema.safeParse(data);
};

export const validateSearchFilter = (data: unknown) => {
  return searchFilterSchema.safeParse(data);
};

// Error formatting utility
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.issues.reduce((acc, error) => {
    const field = error.path.join('.');
    acc[field] = error.message;
    return acc;
  }, {} as Record<string, string>);
};

// Constants for validation
export const VALIDATION_CONSTANTS = {
  URL_REGEX,
  USERNAME_REGEX,
  CATEGORY_REGEX,
  HEX_COLOR_REGEX,
  RESERVED_USERNAMES,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_URL_LENGTH: 2048,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
  MAX_CATEGORY_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MAX_BULK_OPERATIONS: 100
} as const;