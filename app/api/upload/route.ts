import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * POST /api/upload
 * Handle file uploads (multipart/form-data)
 * Returns: { success: boolean, fileId: string, url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // TODO: Implement file upload to storage (S3, R2, Vercel Blob, etc)
    // For now, return mock response
    const fileId = Math.random().toString(36).substring(7);

    return NextResponse.json({
      success: true,
      fileId,
      url: `/api/media/${fileId}`,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("[upload error]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
