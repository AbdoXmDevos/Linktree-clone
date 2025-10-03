// Tests for validation utilities and schemas
import { describe, it, expect } from 'vitest';
import {
  validateLinkFormData,
  validateProfileFormData,
  validateCategoryFormData,
  validateBulkOperationData,
  validateSearchFilterData,
  isValidUrl,
  normalizeUrl,
  isValidUsername,
  suggestUsername,
  isValidHexColor,
  normalizeHexColor,
  getContrastColor,
  validateTags,
  normalizeTags,
  validateImageFile,
  sanitizeFormData
} from '../validation';

describe('Link Form Validation', () => {
  it('should validate a valid link form', () => {
    const validData = {
      title: 'My Website',
      url: 'https://example.com',
      description: 'A great website',
      icon: 'globe',
      category: 'websites',
      tags: ['web', 'example'],
      customStyling: {
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        borderRadius: 8
      },
      isFeatured: false
    };

    const result = validateLinkFormData(validData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject invalid URL', () => {
    const invalidData = {
      title: 'My Website',
      url: 'not-a-url',
      description: 'A great website'
    };

    const result = validateLinkFormData(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.url).toContain('valid URL');
  });

  it('should reject title that is too long', () => {
    const invalidData = {
      title: 'A'.repeat(101), // Too long
      url: 'https://example.com',
      description: 'A great website'
    };

    const result = validateLinkFormData(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.title).toContain('less than 100 characters');
  });

  it('should reject too many tags', () => {
    const invalidData = {
      title: 'My Website',
      url: 'https://example.com',
      tags: Array(11).fill('tag') // Too many tags
    };

    const result = validateLinkFormData(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.tags).toContain('Maximum 10 tags');
  });
});

describe('Profile Form Validation', () => {
  it('should validate a valid profile form', () => {
    const validData = {
      displayName: 'John Doe',
      bio: 'Software developer',
      username: 'johndoe',
      theme: 'light',
      customization: {
        primaryColor: '#3B82F6',
        backgroundStyle: 'solid',
        backgroundValue: '#FFFFFF'
      },
      privacy: {
        analyticsEnabled: true,
        publicProfile: true,
        showAnalytics: false,
        allowIndexing: true
      }
    };

    const result = validateProfileFormData(validData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject reserved username', () => {
    const invalidData = {
      displayName: 'Admin User',
      username: 'admin', // Reserved username
      theme: 'light',
      customization: {
        primaryColor: '#3B82F6',
        backgroundStyle: 'solid',
        backgroundValue: '#FFFFFF'
      }
    };

    const result = validateProfileFormData(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.username).toContain('reserved');
  });

  it('should reject username with invalid characters', () => {
    const invalidData = {
      displayName: 'John Doe',
      username: 'john@doe', // Invalid characters
      theme: 'light',
      customization: {
        primaryColor: '#3B82F6',
        backgroundStyle: 'solid',
        backgroundValue: '#FFFFFF'
      }
    };

    const result = validateProfileFormData(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors?.username).toContain('letters, numbers, hyphens');
  });
});

describe('URL Validation Utilities', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('should normalize URLs', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });
});

describe('Username Validation Utilities', () => {
  it('should validate correct usernames', () => {
    expect(isValidUsername('johndoe')).toBe(true);
    expect(isValidUsername('john_doe')).toBe(true);
    expect(isValidUsername('john-doe')).toBe(true);
    expect(isValidUsername('user123')).toBe(true);
  });

  it('should reject invalid usernames', () => {
    expect(isValidUsername('admin')).toBe(false); // Reserved
    expect(isValidUsername('jo')).toBe(false); // Too short
    expect(isValidUsername('john@doe')).toBe(false); // Invalid characters
  });

  it('should suggest valid usernames', () => {
    const suggestion = suggestUsername('John Doe');
    expect(isValidUsername(suggestion)).toBe(true);
    expect(suggestion).toMatch(/^[a-z0-9_-]+$/);
  });
});

describe('Color Validation Utilities', () => {
  it('should validate hex colors', () => {
    expect(isValidHexColor('#3B82F6')).toBe(true);
    expect(isValidHexColor('#FFF')).toBe(true);
    expect(isValidHexColor('#000000')).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(isValidHexColor('3B82F6')).toBe(false); // Missing #
    expect(isValidHexColor('#GGG')).toBe(false); // Invalid characters
    expect(isValidHexColor('#12345')).toBe(false); // Invalid length
  });

  it('should normalize hex colors', () => {
    expect(normalizeHexColor('3B82F6')).toBe('#3B82F6');
    expect(normalizeHexColor('#fff')).toBe('#FFFFFF');
  });

  it('should calculate contrast colors', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#000000'); // White -> Black
    expect(getContrastColor('#000000')).toBe('#FFFFFF'); // Black -> White
  });
});

describe('Tag Validation Utilities', () => {
  it('should validate and separate valid/invalid tags', () => {
    const tags = ['valid', 'also-valid', '', 'way-too-long-tag-name-that-exceeds-limit', 'valid_tag'];
    const result = validateTags(tags);
    
    expect(result.valid).toContain('valid');
    expect(result.valid).toContain('also-valid');
    expect(result.valid).toContain('valid_tag');
    expect(result.invalid).toContain('');
    expect(result.invalid).toContain('way-too-long-tag-name-that-exceeds-limit');
  });

  it('should normalize tags', () => {
    const tags = ['  Tag1  ', 'TAG2', 'tag1', 'Tag3', ''];
    const normalized = normalizeTags(tags);
    
    expect(normalized).toEqual(['tag1', 'tag2', 'tag3']);
    expect(normalized.length).toBe(3); // Duplicates and empty removed
  });
});

describe('File Validation Utilities', () => {
  it('should validate image files', () => {
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(validFile);
    expect(result.success).toBe(true);
  });

  it('should reject non-image files', () => {
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
    const result = validateImageFile(invalidFile);
    expect(result.success).toBe(false);
    expect(result.errors?.file).toContain('JPEG, PNG, GIF');
  });
});

describe('Form Data Sanitization', () => {
  it('should sanitize form data', () => {
    const dirtyData = {
      title: '  My Title  ',
      description: 'Description\0with\0nulls',
      tags: ['  tag1  ', '  tag2  '],
      number: 123
    };

    const sanitized = sanitizeFormData(dirtyData);
    
    expect(sanitized.title).toBe('My Title');
    expect(sanitized.description).toBe('Descriptionwithnulls');
    expect(sanitized.tags).toEqual(['tag1', 'tag2']);
    expect(sanitized.number).toBe(123);
  });
});

describe('Bulk Operation Validation', () => {
  it('should validate bulk delete operation', () => {
    const validData = {
      type: 'delete',
      linkIds: ['550e8400-e29b-41d4-a716-446655440000']
    };

    const result = validateBulkOperationData(validData);
    expect(result.success).toBe(true);
  });

  it('should require data for categorize operation', () => {
    const invalidData = {
      type: 'categorize',
      linkIds: ['550e8400-e29b-41d4-a716-446655440000']
      // Missing data.category
    };

    const result = validateBulkOperationData(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Search Filter Validation', () => {
  it('should validate search filter data', () => {
    const validData = {
      query: 'test',
      categories: ['web'],
      sortBy: 'title',
      sortOrder: 'asc'
    };

    const result = validateSearchFilterData(validData);
    expect(result.success).toBe(true);
  });

  it('should validate date range', () => {
    const invalidData = {
      dateRange: {
        from: new Date('2024-01-02'),
        to: new Date('2024-01-01') // End before start
      }
    };

    const result = validateSearchFilterData(invalidData);
    expect(result.success).toBe(false);
  });
});