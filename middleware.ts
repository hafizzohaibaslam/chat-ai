// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Refresh session and get user
  const { supabaseResponse, user } = await updateSession(request);

  // Protect the /chat route
  if (request.nextUrl.pathname.startsWith("/chat")) {
    if (!user) {
      // If user is not signed in, redirect to /signin (or another route)
      const signInUrl = new URL("/signin", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return supabaseResponse;
}

// Only run middleware on certain paths:
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * and any static assets like .svg, .png, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
