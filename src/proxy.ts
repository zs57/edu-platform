import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth/login") || req.nextUrl.pathname.startsWith("/auth/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
    secret: process.env.NEXTAUTH_SECRET || "f15e8b4c2b9a1d3e5f7a9c1e3b56d7f9a1c2e4f6a", // Matches auth.ts EXACTLY
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
