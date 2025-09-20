import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;
        const username = formData.get("username") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No image file provided" },
                { status: 400 }
            );
        }

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // Check file size (max 32MB as per ImgBB limit)
        if (file.size > 32 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size too large. Maximum 32MB allowed." },
                { status: 400 }
            );
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "File must be an image" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Compress and resize image using Sharp
        const compressedBuffer = await sharp(buffer)
            .resize(400, 400, {
                fit: "cover",
                position: "center"
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toBuffer();

        // Convert to base64 for ImgBB
        const base64Image = compressedBuffer.toString("base64");

        // Create filename with username and timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${username}-${timestamp}`;

        // Upload to ImgBB
        const imgbbApiKey = process.env.IMGBB_API_KEY;
        if (!imgbbApiKey) {
            return NextResponse.json(
                { error: "ImgBB API key not configured" },
                { status: 500 }
            );
        }

        const imgbbFormData = new FormData();
        imgbbFormData.append("key", imgbbApiKey);
        imgbbFormData.append("image", base64Image);
        imgbbFormData.append("name", filename);

        const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: imgbbFormData,
        });

        if (!imgbbResponse.ok) {
            const errorData = await imgbbResponse.text();
            console.error("ImgBB upload failed:", errorData);
            return NextResponse.json(
                { error: "Failed to upload image to ImgBB" },
                { status: 500 }
            );
        }

        const imgbbData = await imgbbResponse.json();

        if (!imgbbData.success) {
            return NextResponse.json(
                { error: "ImgBB upload failed" },
                { status: 500 }
            );
        }

        // Return the image URL
        return NextResponse.json({
            success: true,
            imageUrl: imgbbData.data.url,
            displayUrl: imgbbData.data.display_url,
            deleteUrl: imgbbData.data.delete_url,
        });

    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}