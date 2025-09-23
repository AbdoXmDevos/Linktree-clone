import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import * as schema from "../../../../../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name: null, // Will be set when user creates profile
        email,
        password: hashedPassword, // Store the hashed password
        emailVerified: null,
        image: null,
        created_at: new Date(),
      })
      .returning();

    return NextResponse.json(
      { message: "User created successfully", userId: newUser[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}