import { NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file" },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipe file tidak didukung. Hanya video dan gambar.",
        },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop();
    const folder = file.type.startsWith("video/") ? "videos" : "images";
    const key = `${folder}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      })
      .promise();

    const endpoint = new URL(process.env.S3_ENDPOINT_URL!).host;
    const publicUrl = `https://${process.env.S3_BUCKET}.${endpoint}/${key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      type: file.type.startsWith("video/") ? "video" : "image",
    });
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Upload gagal" },
      { status: 500 },
    );
  }
}
