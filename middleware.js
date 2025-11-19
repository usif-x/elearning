// middleware.js

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper function to parse auth data from cookies
async function getAuthFromCookies() {
  const cookieStore = await cookies();
  try {
    const authCookie = cookieStore.get("auth-storage");

    if (!authCookie || !authCookie.value) {
      return null;
    }

    const parsed = JSON.parse(authCookie.value);
    const state = parsed.state || parsed;

    return {
      isAuthenticated: state.isAuthenticated || false,
      user: state.user || null,
      admin: state.admin || null,
      token: state.token || null,
      userType: state.userType || null,
    };
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 1. Get Authentication State from cookies
  const authState = await getAuthFromCookies();

  // 2. Determine authentication status - trust the cookie state for navigation
  const isAuthenticated = authState?.isAuthenticated || false;
  const userRole = authState?.userType || null;
  const isAdmin = isAuthenticated && userRole === "admin";
  const isUser = isAuthenticated && userRole === "user";

  console.log(
    `[Middleware] ${pathname} - Authenticated: ${isAuthenticated}, Role: ${userRole}`
  );

  // Route definitions
  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPath = pathname === "/login" || pathname === "/register";
  const isUserProtectedPath = [
    "/profile",
    "/dashboard",
    "/community",
    "/courses",
    "/practice-quiz",
    "/questions-forum",
  ].some((p) => pathname.startsWith(p));
  const isActionPath = /\/(enroll|book)\/?$/.test(pathname);

  // Helper function for redirects
  const createRedirectResponse = (url) => {
    return NextResponse.redirect(new URL(url, request.url));
  };

  // Route handling logic
  if (isAdminPath) {
    if (pathname.startsWith("/admin/login")) {
      if (isAdmin) {
        return createRedirectResponse("/admin/dashboard");
      }
      return NextResponse.next();
    }

    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return createRedirectResponse(loginUrl.toString());
    }
  }

  if (isAuthPath) {
    if (isAuthenticated) {
      if (isAdmin) {
        return createRedirectResponse("/admin/dashboard");
      }
      if (isUser) {
        return createRedirectResponse("/profile");
      }
    }
  }

  if (isUserProtectedPath || isActionPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return createRedirectResponse(loginUrl.toString());
    }

    // Redirect admin users accessing profile to admin dashboard
    if (isAdmin && pathname.startsWith("/profile")) {
      return createRedirectResponse("/admin/dashboard");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next(?:/static|/image)|favicon\\.ico|image/|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico)$).*)",
  ],
};
