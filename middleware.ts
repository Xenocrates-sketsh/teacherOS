import { getServerSession } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/join"];

export function middleware(request: NextRequest) {
  const session = getServerSession(request.headers.get("cookie") || "");

  if (!session && !publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && publicPaths.some((p) => request.nextUrl.pathname === p)) {
    const dashboard = session.role === "teacher" ? "/dashboard" : "/student";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
