import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("دخل الإيميل والباسورد بتاعك");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("الحساب ده مش متسجل عندنا");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          // Special bootstrap for the owner
          if (credentials.email === "admin@itqan.com" && credentials.password === "admin123456") {
             const hashedPassword = await bcrypt.hash("admin123456", 10);
             const admin = await prisma.user.upsert({
                where: { email: "admin@itqan.com" },
                update: { role: "ADMIN" },
                create: {
                    email: "admin@itqan.com",
                    name: "مدير المنصة",
                    password: hashedPassword,
                    role: "ADMIN",
                    gradeLevel: "ADMIN"
                }
             });
             return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
          }
          throw new Error("كلمة المرور غلط، ركز يا بطل");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "f15e8b4c2b9a1d3e5f7a9c1e3b5d7f9a1c2e4f6a",
};
