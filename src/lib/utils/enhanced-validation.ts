// Enhanced validation utilities for real-time form feedback
import { z } from 'zod';
import { linkFormSchema, VALIDATION_CONSTANTS } from '../../../types/validation';

// Enhanced validation result interface
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  type?: 'format' | 'length' | 'required' | 'pattern' | 'custom';
}

// URL validation with enhanced feedback
export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim().length === 0) {
    return { 
      isValid: false, 
      message: "URL is required", 
      severity: 'error',
      type: 'required'
    };
  }

  const trimmedUrl = url.trim();
  
  // Check if URL starts with protocol
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    const suggestion = trimmedUrl.startsWith('www.') 
      ? `https://${trimmedUrl}`
      : `https://${trimmedUrl}`;
    
    return { 
      isValid: false, 
      message: "URL must start with http:// or https://",
      suggestion,
      severity: 'error',
      type: 'format'
    };
  }

  // Check URL format
  if (!VALIDATION_CONSTANTS.URL_REGEX.test(trimmedUrl)) {
    return { 
      isValid: false, 
      message: "Please enter a valid URL format", 
      severity: 'error',
      type: 'format'
    };
  }

  // Check URL length
  if (trimmedUrl.length > VALIDATION_CONSTANTS.MAX_URL_LENGTH) {
    return { 
      isValid: false, 
      message: `URL must be ${VALIDATION_CONSTANTS.MAX_URL_LENGTH} characters or less`, 
      severity: 'error',
      type: 'length'
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /localhost/i,
    /127\.0\.0\.1/,
    /192\.168\./,
    /10\.\d+\.\d+\.\d+/,
    /172\.(1[6-9]|2\d|3[01])\./
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(trimmedUrl))) {
    return {
      isValid: true,
      message: "This appears to be a local/private URL",
      severity: 'warning',
      type: 'custom'
    };
  }

  return { 
    isValid: true, 
    message: "URL format is valid",
    severity: 'success',
    type: 'format'
  };
};

// Title validation with enhanced feedback
export const validateTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { 
      isValid: false, 
      message: "Title is required", 
      severity: 'error',
      type: 'required'
    };
  }

  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < 2) {
    return { 
      isValid: false, 
      message: "Title must be at least 2 characters long", 
      severity: 'error',
      type: 'length'
    };
  }

  if (trimmedTitle.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
    return { 
      isValid: false, 
      message: `Title must be ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters or less`, 
      severity: 'error',
      type: 'length'
    };
  }

  // Check for optimal title length
  if (trimmedTitle.length < 10) {
    return {
      isValid: true,
      message: "Consider adding more descriptive text",
      severity: 'info',
      type: 'custom'
    };
  }

  if (trimmedTitle.length > 60) {
    return {
      isValid: true,
      message: "Long titles may be truncated in some views",
      severity: 'warning',
      type: 'custom'
    };
  }

  return { 
    isValid: true, 
    message: "Title looks good",
    severity: 'success',
    type: 'format'
  };
};

// Description validation with enhanced feedback
export const validateDescription = (description: string): ValidationResult => {
  if (!description || description.trim().length === 0) {
    return { 
      isValid: true, 
      message: "Description is optional but recommended",
      severity: 'info',
      type: 'custom'
    };
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length > VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
    return { 
      isValid: false, 
      message: `Description must be ${VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters or less`, 
      severity: 'error',
      type: 'length'
    };
  }

  // Check for optimal description length
  if (trimmedDescription.length < 20) {
    return {
      isValid: true,
      message: "Consider adding more details to help users understand this link",
      severity: 'info',
      type: 'custom'
    };
  }

  if (trimmedDescription.length > 150) {
    return {
      isValid: true,
      message: "Long descriptions may be truncated in previews",
      severity: 'warning',
      type: 'custom'
    };
  }

  return { 
    isValid: true, 
    message: "Description looks good",
    severity: 'success',
    type: 'format'
  };
};

// Icon validation with enhanced feedback
export const validateIcon = (icon: string): ValidationResult & { iconType?: 'emoji' | 'url' | 'empty' } => {
  if (!icon || icon.trim().length === 0) {
    return { 
      isValid: true, 
      message: "Icon is optional",
      severity: 'info',
      type: 'custom',
      iconType: 'empty'
    };
  }

  const trimmedIcon = icon.trim();
  
  // Check if it's an emoji (enhanced emoji detection)
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]$/u;
  
  if (emojiRegex.test(trimmedIcon) && trimmedIcon.length <= 4) {
    return { 
      isValid: true, 
      message: "Emoji icon ready",
      severity: 'success',
      type: 'format',
      iconType: 'emoji'
    };
  }

  // Check if it's a valid image URL
  const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp|ico)(\?.*)?$/i;
  
  if (imageUrlRegex.test(trimmedIcon)) {
    return { 
      isValid: true, 
      message: "Image URL detected",
      severity: 'success',
      type: 'format',
      iconType: 'url'
    };
  }

  // Check if it looks like a URL but doesn't match image pattern
  if (trimmedIcon.startsWith('http://') || trimmedIcon.startsWith('https://')) {
    return { 
      isValid: false, 
      message: "Icon URL must point to an image file (jpg, jpeg, png, gif, svg, webp, ico)",
      severity: 'error',
      type: 'format',
      iconType: 'url'
    };
  }

  // If it's not an emoji or URL, check length
  if (trimmedIcon.length > 4) {
    return { 
      isValid: false, 
      message: "Icon should be an emoji (like 🔗) or a valid image URL",
      severity: 'error',
      type: 'format'
    };
  }

  return { 
    isValid: true, 
    message: "Icon format accepted",
    severity: 'success',
    type: 'format',
    iconType: 'emoji'
  };
};

// Category validation with enhanced feedback
export const validateCategory = (category: string): ValidationResult => {
  if (!category || category.trim().length === 0) {
    return { 
      isValid: true, 
      message: "Category is optional but helps organize your links",
      severity: 'info',
      type: 'custom'
    };
  }

  const trimmedCategory = category.trim();

  if (trimmedCategory.length > VALIDATION_CONSTANTS.MAX_CATEGORY_LENGTH) {
    return { 
      isValid: false, 
      message: `Category must be ${VALIDATION_CONSTANTS.MAX_CATEGORY_LENGTH} characters or less`, 
      severity: 'error',
      type: 'length'
    };
  }

  if (!VALIDATION_CONSTANTS.CATEGORY_REGEX.test(trimmedCategory)) {
    return { 
      isValid: false, 
      message: "Category can only contain letters, numbers, spaces, and hyphens", 
      severity: 'error',
      type: 'pattern'
    };
  }

  return { 
    isValid: true, 
    message: "Category looks good",
    severity: 'success',
    type: 'format'
  };
};

// Tags validation with enhanced feedback
export const validateTags = (tags: string[]): ValidationResult => {
  if (!tags || tags.length === 0) {
    return { 
      isValid: true, 
      message: "Tags are optional but help organize and filter your links",
      severity: 'info',
      type: 'custom'
    };
  }

  if (tags.length > VALIDATION_CONSTANTS.MAX_TAGS) {
    return { 
      isValid: false, 
      message: `Maximum ${VALIDATION_CONSTANTS.MAX_TAGS} tags allowed`, 
      severity: 'error',
      type: 'length'
    };
  }

  // Check individual tag validity
  for (const tag of tags) {
    if (tag.length > VALIDATION_CONSTANTS.MAX_TAG_LENGTH) {
      return { 
        isValid: false, 
        message: `Each tag must be ${VALIDATION_CONSTANTS.MAX_TAG_LENGTH} characters or less`, 
        severity: 'error',
        type: 'length'
      };
    }

    if (!VALIDATION_CONSTANTS.CATEGORY_REGEX.test(tag)) {
      return { 
        isValid: false, 
        message: "Tags can only contain letters, numbers, spaces, and hyphens", 
        severity: 'error',
        type: 'pattern'
      };
    }
  }

  // Check for duplicate tags
  const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()));
  if (uniqueTags.size !== tags.length) {
    return { 
      isValid: false, 
      message: "Duplicate tags are not allowed", 
      severity: 'error',
      type: 'custom'
    };
  }

  if (tags.length > 5) {
    return {
      isValid: true,
      message: "Many tags may make filtering less effective",
      severity: 'warning',
      type: 'custom'
    };
  }

  return { 
    isValid: true, 
    message: `${tags.length} tag${tags.length === 1 ? '' : 's'} added`,
    severity: 'success',
    type: 'format'
  };
};

// Color validation with enhanced feedback
export const validateColor = (color: string, fieldName: string = 'Color'): ValidationResult => {
  if (!color || color.trim().length === 0) {
    return { 
      isValid: true, 
      message: `${fieldName} is optional`,
      severity: 'info',
      type: 'custom'
    };
  }

  const trimmedColor = color.trim();

  if (!VALIDATION_CONSTANTS.HEX_COLOR_REGEX.test(trimmedColor)) {
    return { 
      isValid: false, 
      message: `${fieldName} must be a valid hex color (e.g., #FF0000)`, 
      severity: 'error',
      type: 'format'
    };
  }

  return { 
    isValid: true, 
    message: `${fieldName} is valid`,
    severity: 'success',
    type: 'format'
  };
};

// Comprehensive form validation
export const validateLinkForm = (data: any): { isValid: boolean; errors: Record<string, ValidationResult> } => {
  const errors: Record<string, ValidationResult> = {};

  // Validate each field
  const titleResult = validateTitle(data.title);
  if (!titleResult.isValid) errors.title = titleResult;

  const urlResult = validateUrl(data.url);
  if (!urlResult.isValid) errors.url = urlResult;

  const descriptionResult = validateDescription(data.description);
  if (!descriptionResult.isValid) errors.description = descriptionResult;

  const iconResult = validateIcon(data.icon);
  if (!iconResult.isValid) errors.icon = iconResult;

  const categoryResult = validateCategory(data.category);
  if (!categoryResult.isValid) errors.category = categoryResult;

  const tagsResult = validateTags(data.tags);
  if (!tagsResult.isValid) errors.tags = tagsResult;

  // Validate custom styling colors
  if (data.customStyling) {
    if (data.customStyling.backgroundColor) {
      const bgColorResult = validateColor(data.customStyling.backgroundColor, 'Background color');
      if (!bgColorResult.isValid) errors['customStyling.backgroundColor'] = bgColorResult;
    }

    if (data.customStyling.textColor) {
      const textColorResult = validateColor(data.customStyling.textColor, 'Text color');
      if (!textColorResult.isValid) errors['customStyling.textColor'] = textColorResult;
    }

    if (data.customStyling.borderColor) {
      const borderColorResult = validateColor(data.customStyling.borderColor, 'Border color');
      if (!borderColorResult.isValid) errors['customStyling.borderColor'] = borderColorResult;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility to get validation message color based on severity
export const getValidationColor = (severity: ValidationResult['severity']): string => {
  switch (severity) {
    case 'error': return 'red';
    case 'warning': return 'orange';
    case 'info': return 'blue';
    case 'success': return 'green';
    default: return 'gray';
  }
};

// Utility to get validation icon based on severity
export const getValidationIcon = (severity: ValidationResult['severity']): string => {
  switch (severity) {
    case 'error': return 'IconAlertCircle';
    case 'warning': return 'IconAlertTriangle';
    case 'info': return 'IconInfoCircle';
    case 'success': return 'IconCheck';
    default: return 'IconInfoCircle';
  }
};