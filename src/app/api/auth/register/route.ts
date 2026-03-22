import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, gradeLevel } = await req.json();

    if (!email || !password || !name || !gradeLevel) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Bootstrap: First user is admin, and specifically the owner's email
    const userCount = await prisma.user.count();
    const isOwner = email === "z51722369@gmail.com";
    const isFirstUser = userCount === 0;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gradeLevel,
        role: (isOwner || isFirstUser) ? "ADMIN" : (role === "ADMIN" ? "ADMIN" : "STUDENT"), 
      }
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
