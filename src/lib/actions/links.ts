"use server";

import { revalidatePath } from "next/cache";
import { db } from "../../../lib/db";
import * as schema from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import type { Link, LinkFormData } from "../../../types/dashboard";

// Error types for better error handling
export interface ActionError {
  type: 'validation' | 'network' | 'database' | 'not_found' | 'permission' | 'unknown';
  message: string;
  field?: string;
  retryable?: boolean;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: ActionError;
}

// Enhanced error handling utility
function createActionError(
  type: ActionError['type'], 
  message: string, 
  field?: string, 
  retryable: boolean = false
): ActionError {
  return { type, message, field, retryable };
}

// Network connectivity check (simplified)
async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    // Simple database connectivity check
    await db.select().from(schema.users).limit(1);
    return true;
  } catch {
    return false;
  }
}

// Enhanced validation helper function
function validateLinkData(formData: LinkFormData): ActionError[] {
  const errors: ActionError[] = [];

  // Title validation
  if (!formData.title?.trim()) {
    errors.push(createActionError('validation', 'Title is required', 'title'));
  } else if (formData.title.trim().length < 2) {
    errors.push(createActionError('validation', 'Title must be at least 2 characters long', 'title'));
  } else if (formData.title.length > 100) {
    errors.push(createActionError('validation', 'Title must be 100 characters or less', 'title'));
  }

  // URL validation
  if (!formData.url?.trim()) {
    errors.push(createActionError('validation', 'URL is required', 'url'));
  } else {
    const urlRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;
    const simpleUrlRegex = /^https?:\/\/.+/;
    
    if (!simpleUrlRegex.test(formData.url.trim())) {
      errors.push(createActionError('validation', 'URL must start with http:// or https://', 'url'));
    } else if (!urlRegex.test(formData.url.trim())) {
      errors.push(createActionError('validation', 'Please enter a valid URL format', 'url'));
    } else if (formData.url.length > 2000) {
      errors.push(createActionError('validation', 'URL must be 2000 characters or less', 'url'));
    }
  }

  // Description validation
  if (formData.description && formData.description.length > 200) {
    errors.push(createActionError('validation', 'Description must be 200 characters or less', 'description'));
  }

  // Icon validation
  if (formData.icon && formData.icon.trim().length > 0) {
    const iconValue = formData.icon.trim();
    const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i;
    const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u;
    const simpleUrlRegex = /^https?:\/\/.+/;
    
    const isEmoji = emojiRegex.test(iconValue) && iconValue.length <= 4;
    const isImageUrl = imageUrlRegex.test(iconValue);
    const isUrl = simpleUrlRegex.test(iconValue);
    
    if (!isEmoji && !isImageUrl) {
      if (isUrl) {
        errors.push(createActionError('validation', 'Icon URL must point to an image file (jpg, jpeg, png, gif, svg, webp)', 'icon'));
      } else if (iconValue.length > 4) {
        errors.push(createActionError('validation', 'Icon should be an emoji or a valid image URL', 'icon'));
      }
    }
  }

  return errors;
}

// Server action to create a new link with comprehensive error handling
export async function createLink(profileId: string, formData: LinkFormData): Promise<ActionResult<Link>> {
  try {
    // Input validation
    if (!profileId) {
      return {
        success: false,
        error: createActionError('validation', 'Profile ID is required')
      };
    }

    // Validate form data
    const validationErrors = validateLinkData(formData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors[0] // Return first validation error
      };
    }

    // Check network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      return {
        success: false,
        error: createActionError('network', 'Unable to connect to the database. Please check your internet connection and try again.', undefined, true)
      };
    }

    // Get the current max order_index for this profile
    const existingLinks = await db
      .select({ order_index: schema.links.order_index })
      .from(schema.links)
      .where(eq(schema.links.profile_id, profileId))
      .orderBy(desc(schema.links.order_index))
      .limit(1);

    const nextOrderIndex = existingLinks.length > 0 ? (existingLinks[0].order_index || 0) + 1 : 0;

    // Create link with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const newLink = await db
          .insert(schema.links)
          .values({
            profile_id: profileId,
            title: formData.title.trim(),
            url: formData.url.trim(),
            description: formData.description?.trim() || null,
            icon: formData.icon?.trim() || null,
            order_index: nextOrderIndex,
          })
          .returning();

        if (newLink.length === 0) {
          throw new Error("No link was created");
        }

        // Revalidate the dashboard page to reflect changes
        revalidatePath("/dashboard");
        
        return {
          success: true,
          data: newLink[0]
        };
      } catch (dbError: any) {
        retryCount++;
        
        // Check for specific database errors
        if (dbError.code === '23505') { // Unique constraint violation
          return {
            success: false,
            error: createActionError('database', 'A link with this URL already exists')
          };
        }
        
        if (dbError.code === '23503') { // Foreign key constraint violation
          return {
            success: false,
            error: createActionError('database', 'Invalid profile ID')
          };
        }
        
        // If it's the last retry, throw the error
        if (retryCount >= maxRetries) {
          throw dbError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    // This should never be reached, but just in case
    return {
      success: false,
      error: createActionError('unknown', 'Failed to create link after multiple attempts', undefined, true)
    };

  } catch (error: any) {
    console.error("Create link error:", error);
    
    // Categorize the error
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: createActionError('network', 'Network error occurred. Please check your connection and try again.', undefined, true)
      };
    }
    
    if (error.message?.includes('timeout')) {
      return {
        success: false,
        error: createActionError('network', 'Request timed out. Please try again.', undefined, true)
      };
    }
    
    return {
      success: false,
      error: createActionError('unknown', error.message || 'An unexpected error occurred while creating the link', undefined, true)
    };
  }
}

// Server action to update an existing link with comprehensive error handling
export async function updateLink(linkId: string, formData: LinkFormData): Promise<ActionResult<Link>> {
  try {
    // Input validation
    if (!linkId) {
      return {
        success: false,
        error: createActionError('validation', 'Link ID is required')
      };
    }

    // Validate form data
    const validationErrors = validateLinkData(formData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors[0] // Return first validation error
      };
    }

    // Check network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      return {
        success: false,
        error: createActionError('network', 'Unable to connect to the database. Please check your internet connection and try again.', undefined, true)
      };
    }

    // Update link with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const updatedLink = await db
          .update(schema.links)
          .set({
            title: formData.title.trim(),
            url: formData.url.trim(),
            description: formData.description?.trim() || null,
            icon: formData.icon?.trim() || null,
          })
          .where(eq(schema.links.id, linkId))
          .returning();

        if (updatedLink.length === 0) {
          return {
            success: false,
            error: createActionError('not_found', 'Link not found. It may have been deleted.')
          };
        }

        // Revalidate the dashboard page to reflect changes
        revalidatePath("/dashboard");
        
        return {
          success: true,
          data: updatedLink[0]
        };
      } catch (dbError: any) {
        retryCount++;
        
        // Check for specific database errors
        if (dbError.code === '23505') { // Unique constraint violation
          return {
            success: false,
            error: createActionError('database', 'A link with this URL already exists')
          };
        }
        
        // If it's the last retry, throw the error
        if (retryCount >= maxRetries) {
          throw dbError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    return {
      success: false,
      error: createActionError('unknown', 'Failed to update link after multiple attempts', undefined, true)
    };

  } catch (error: any) {
    console.error("Update link error:", error);
    
    // Categorize the error
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: createActionError('network', 'Network error occurred. Please check your connection and try again.', undefined, true)
      };
    }
    
    if (error.message?.includes('timeout')) {
      return {
        success: false,
        error: createActionError('network', 'Request timed out. Please try again.', undefined, true)
      };
    }
    
    return {
      success: false,
      error: createActionError('unknown', error.message || 'An unexpected error occurred while updating the link', undefined, true)
    };
  }
}

// Server action to delete a link with comprehensive error handling
export async function deleteLink(linkId: string): Promise<ActionResult<void>> {
  try {
    if (!linkId) {
      return {
        success: false,
        error: createActionError('validation', 'Link ID is required')
      };
    }

    // Check network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      return {
        success: false,
        error: createActionError('network', 'Unable to connect to the database. Please check your internet connection and try again.', undefined, true)
      };
    }

    // Delete link with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const deletedLink = await db
          .delete(schema.links)
          .where(eq(schema.links.id, linkId))
          .returning();

        if (deletedLink.length === 0) {
          return {
            success: false,
            error: createActionError('not_found', 'Link not found. It may have already been deleted.')
          };
        }
        
        // Revalidate the dashboard page to reflect changes
        revalidatePath("/dashboard");
        
        return { success: true };
      } catch (dbError: any) {
        retryCount++;
        
        // If it's the last retry, throw the error
        if (retryCount >= maxRetries) {
          throw dbError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    return {
      success: false,
      error: createActionError('unknown', 'Failed to delete link after multiple attempts', undefined, true)
    };

  } catch (error: any) {
    console.error("Delete link error:", error);
    
    // Categorize the error
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: createActionError('network', 'Network error occurred. Please check your connection and try again.', undefined, true)
      };
    }
    
    return {
      success: false,
      error: createActionError('unknown', error.message || 'An unexpected error occurred while deleting the link', undefined, true)
    };
  }
}

// Server action to fetch links for a profile with comprehensive error handling
export async function fetchLinks(profileId: string): Promise<ActionResult<Link[]>> {
  try {
    if (!profileId) {
      return {
        success: false,
        error: createActionError('validation', 'Profile ID is required')
      };
    }

    // Check network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      return {
        success: false,
        error: createActionError('network', 'Unable to connect to the database. Please check your internet connection and try again.', undefined, true)
      };
    }

    // Fetch links with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const links = await db
          .select()
          .from(schema.links)
          .where(eq(schema.links.profile_id, profileId))
          .orderBy(schema.links.order_index);

        return {
          success: true,
          data: links
        };
      } catch (dbError: any) {
        retryCount++;
        
        // If it's the last retry, throw the error
        if (retryCount >= maxRetries) {
          throw dbError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    return {
      success: false,
      error: createActionError('unknown', 'Failed to fetch links after multiple attempts', undefined, true)
    };

  } catch (error: any) {
    console.error("Fetch links error:", error);
    
    // Categorize the error
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: createActionError('network', 'Network error occurred. Please check your connection and try again.', undefined, true)
      };
    }
    
    return {
      success: false,
      error: createActionError('unknown', error.message || 'An unexpected error occurred while fetching links', undefined, true)
    };
  }
}