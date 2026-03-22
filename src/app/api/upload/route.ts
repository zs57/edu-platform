import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // In a real application, you would save this to S3, Google Cloud Storage, or local disk.
    // For local mock demonstration, we assume success.
    
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // const buffer = Buffer.from(await file.arrayBuffer());
    // await fs.writeFile(path.join(process.cwd(), "public/uploads", file.name), buffer);

    return NextResponse.json({ 
      message: "File uploaded successfully", 
      filename: file.name,
      url: `/uploads/${file.name}`
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
