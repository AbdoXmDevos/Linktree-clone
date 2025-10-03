// Validation utilities and helpers
import { z } from 'zod';
import {
  linkFormSchema,
  profileFormSchema,
  categoryFormSchema,
  bulkOperationSchema,
  searchFilterSchema,
  formatValidationErrors,
  VALIDATION_CONSTANTS
} from '../../../types/validation';

// Generic validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  fieldErrors?: Record<string, string[]>;
}

// Validation wrapper function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: formatValidationErrors(result.error),
    fieldErrors: result.error.issues.reduce((acc, error) => {
      const field = error.path.join('.');
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(error.message);
      return acc;
    }, {} as Record<string, string[]>)
  };
}

// Specific validation functions
export const validateLinkFormData = (data: unknown) => {
  return validateData(linkFormSchema, data);
};

export const validateProfileFormData = (data: unknown) => {
  return validateData(profileFormSchema, data);
};

export const validateCategoryFormData = (data: unknown) => {
  return validateData(categoryFormSchema, data);
};

export const validateBulkOperationData = (data: unknown) => {
  return validateData(bulkOperationSchema, data);
};

export const validateSearchFilterData = (data: unknown) => {
  return validateData(searchFilterSchema, data);
};

// URL validation utilities
export const isValidUrl = (url: string): boolean => {
  return VALIDATION_CONSTANTS.URL_REGEX.test(url);
};

export const normalizeUrl = (url: string): string => {
  // Add https:// if no protocol is specified
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

export const extractDomain = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

// Username validation utilities
export const isValidUsername = (username: string): boolean => {
  return (
    VALIDATION_CONSTANTS.USERNAME_REGEX.test(username) &&
    username.length >= VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH &&
    username.length <= VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH &&
    !VALIDATION_CONSTANTS.RESERVED_USERNAMES.includes(username.toLowerCase())
  );
};

export const suggestUsername = (displayName: string): string => {
  // Convert display name to valid username format
  let suggestion = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Ensure minimum length
  if (suggestion.length < VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH) {
    suggestion += '123';
  }
  
  // Ensure maximum length
  if (suggestion.length > VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH) {
    suggestion = suggestion.substring(0, VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH);
  }
  
  // Avoid reserved names
  if (VALIDATION_CONSTANTS.RESERVED_USERNAMES.includes(suggestion)) {
    suggestion += '_user';
  }
  
  return suggestion;
};

// Color validation utilities
export const isValidHexColor = (color: string): boolean => {
  return VALIDATION_CONSTANTS.HEX_COLOR_REGEX.test(color);
};

export const normalizeHexColor = (color: string): string => {
  // Add # if missing
  if (!color.startsWith('#')) {
    color = `#${color}`;
  }
  
  // Convert 3-digit hex to 6-digit
  if (color.length === 4) {
    color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  
  return color.toUpperCase();
};

export const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Tag validation utilities
export const validateTags = (tags: string[]): { valid: string[]; invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  tags.forEach(tag => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag.length > 0 &&
      trimmedTag.length <= VALIDATION_CONSTANTS.MAX_TAG_LENGTH &&
      VALIDATION_CONSTANTS.CATEGORY_REGEX.test(trimmedTag)
    ) {
      valid.push(trimmedTag);
    } else {
      invalid.push(tag);
    }
  });
  
  return { valid, invalid };
};

export const normalizeTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter((tag, index, array) => 
      tag.length > 0 && 
      array.indexOf(tag) === index // Remove duplicates
    )
    .slice(0, VALIDATION_CONSTANTS.MAX_TAGS); // Limit to max tags
};

// File validation utilities
export const validateImageFile = (file: File): ValidationResult<File> => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      errors: {
        file: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      }
    };
  }
  
  if (file.size > maxSize) {
    return {
      success: false,
      errors: {
        file: 'Image size must be less than 5MB'
      }
    };
  }
  
  return {
    success: true,
    data: file
  };
};

// Form data sanitization
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Trim whitespace and remove null bytes
      sanitized[key] = value.trim().replace(/\0/g, '');
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? item.trim().replace(/\0/g, '') : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Error message formatting
export const getFieldError = (
  errors: Record<string, string> | undefined,
  field: string
): string | undefined => {
  return errors?.[field];
};

export const hasFieldError = (
  errors: Record<string, string> | undefined,
  field: string
): boolean => {
  return Boolean(errors?.[field]);
};

// Validation constants re-export for convenience
export { VALIDATION_CONSTANTS };