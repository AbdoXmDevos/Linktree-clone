// src/app/api/users/route.ts
import { db } from "../../../../lib/db";
import { users } from "../../../../db/schema"
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newUser = await db
    .insert(users)
    .values({    
    email: body.email,           // required
    password: body.password,     // required
    })
    .returning();

  return NextResponse.json(newUser);
}
