import { NextResponse, type NextRequest } from "next/server";

const SESSION_KEY = "tw_session";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  );
}

export async function updateSession(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(
      new RegExp(`(?:^|; )${SESSION_KEY}=([^;]*)`)
    );
    const hasSession = match !== null;

    if (!hasSession && !isPublicPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  } catch {
    if (!isPublicPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next({ request });
  }
}
