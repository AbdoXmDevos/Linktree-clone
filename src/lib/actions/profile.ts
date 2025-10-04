"use server";

import { db } from "../../../lib/db";
import { profiles } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ProfileUpdateData {
  display_name: string;
  bio: string;
  avatar_url: string;
}

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

export async function updateProfile(
  profileId: string,
  updateData: ProfileUpdateData
): Promise<ActionResult> {
  try {
    // Validate input data
    if (!profileId) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Profile ID is required'
        }
      };
    }

    // Validate display_name length
    if (updateData.display_name && updateData.display_name.length > 50) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Display name must be 50 characters or less'
        }
      };
    }

    // Validate bio length
    if (updateData.bio && updateData.bio.length > 160) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Bio must be 160 characters or less'
        }
      };
    }

    // Validate avatar_url format (basic URL validation)
    if (updateData.avatar_url && updateData.avatar_url.trim() !== '') {
      try {
        new URL(updateData.avatar_url);
      } catch {
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Avatar URL must be a valid URL'
          }
        };
      }
    }

    // Prepare update data (handle empty strings as null)
    const cleanUpdateData = {
      display_name: updateData.display_name.trim() || null,
      bio: updateData.bio.trim() || null,
      avatar_url: updateData.avatar_url.trim() || null,
    };

    // Update profile in database
    const updatedProfiles = await db
      .update(profiles)
      .set(cleanUpdateData)
      .where(eq(profiles.id, profileId))
      .returning();

    if (updatedProfiles.length === 0) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: 'Profile not found'
        }
      };
    }

    // Revalidate the dashboard page to reflect changes
    revalidatePath('/dashboard');

    return {
      success: true,
      data: updatedProfiles[0]
    };

  } catch (error: any) {
    console.error('Error updating profile:', error);

    // Handle different types of database errors
    if (error.code === '23505') { // Unique constraint violation
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'This value is already taken'
        }
      };
    }

    if (error.code === '23503') { // Foreign key constraint violation
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Invalid reference data'
        }
      };
    }

    // Network or connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: {
          type: 'network',
          message: 'Unable to connect to database. Please try again.',
          retryable: true
        }
      };
    }

    // Generic database error
    return {
      success: false,
      error: {
        type: 'database',
        message: 'Failed to update profile. Please try again.',
        retryable: true
      }
    };
  }
}

export async function getProfile(profileId: string): Promise<ActionResult> {
  try {
    if (!profileId) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Profile ID is required'
        }
      };
    }

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    if (profile.length === 0) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: 'Profile not found'
        }
      };
    }

    return {
      success: true,
      data: profile[0]
    };

  } catch (error: any) {
    console.error('Error fetching profile:', error);

    return {
      success: false,
      error: {
        type: 'database',
        message: 'Failed to fetch profile. Please try again.',
        retryable: true
      }
    };
  }
}