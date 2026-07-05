import { NextResponse, type NextRequest } from "next/server";

const projectRef = "fxqdqvkhxedlcwhfjaua";

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      if (!isPublicPath(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next({ request });
    }

    // Check for auth session via the access token cookie
    const accessToken =
      request.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
      request.cookies.get(`sb-access-token`)?.value;

    let isAuthenticated = false;

    if (accessToken) {
      try {
        const res = await fetch(
          `${supabaseUrl}/auth/v1/user`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await res.json();
        isAuthenticated = !!data.id;
      } catch {
        // Auth check failed, treat as unauthenticated
      }
    }

    if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next({ request });
  } catch {
    if (!isPublicPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next({ request });
  }
}
