import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import * as schema from "../../../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { profileId, title, url, description, icon } = await request.json();

    // Validation
    if (!profileId || !title || !url) {
      return NextResponse.json(
        { error: "Profile ID, title, and URL are required" },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(url)) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 }
      );
    }

    if (url.length > 2000) {
      return NextResponse.json(
        { error: "URL must be 2000 characters or less" },
        { status: 400 }
      );
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: "Description must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Get the current max order_index for this profile
    const existingLinks = await db
      .select({ order_index: schema.links.order_index })
      .from(schema.links)
      .where(eq(schema.links.profile_id, profileId))
      .orderBy(desc(schema.links.order_index))
      .limit(1);

    const nextOrderIndex = existingLinks.length > 0 ? (existingLinks[0].order_index || 0) + 1 : 0;

    // Create link
    const newLink = await db
      .insert(schema.links)
      .values({
        profile_id: profileId,
        title: title.trim(),
        url: url.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        order_index: nextOrderIndex,
      })
      .returning();

    return NextResponse.json(
      { 
        message: "Link created successfully", 
        link: newLink[0] 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Link creation error:", error);
    return NextResponse.json(
      { error: "Failed to create link. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const links = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.profile_id, profileId))
      .orderBy(schema.links.order_index);

    return NextResponse.json(links);
  } catch (error) {
    console.error("Links fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { linkId, title, url, description, icon } = await request.json();

    // Validation
    if (!linkId || !title || !url) {
      return NextResponse.json(
        { error: "Link ID, title, and URL are required" },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(url)) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 }
      );
    }

    if (url.length > 2000) {
      return NextResponse.json(
        { error: "URL must be 2000 characters or less" },
        { status: 400 }
      );
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: "Description must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Update link
    const updatedLink = await db
      .update(schema.links)
      .set({
        title: title.trim(),
        url: url.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
      })
      .where(eq(schema.links.id, linkId))
      .returning();

    if (updatedLink.length === 0) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: "Link updated successfully", 
        link: updatedLink[0] 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link update error:", error);
    return NextResponse.json(
      { error: "Failed to update link. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    const deletedLink = await db
      .delete(schema.links)
      .where(eq(schema.links.id, linkId))
      .returning();

    if (deletedLink.length === 0) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Link deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete link. Please try again." },
      { status: 500 }
    );
  }
}