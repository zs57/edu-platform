import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  // Check authorization
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename to avoid collisions
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write file to local disk
    await fs.writeFile(path.join(uploadDir, uniqueFilename), buffer);

    return NextResponse.json({ 
      message: "File uploaded successfully", 
      filename: uniqueFilename,
      url: `/uploads/${uniqueFilename}`
    }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
