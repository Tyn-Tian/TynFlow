import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LIVE_ACCESS_USER_ID = "8017eb2d-1c88-4e83-ba13-80ce15477154";
const JOB_ACCESS_USER_ID = "d4e69f3b-c49e-4b65-ad03-50f6cb803571";
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/wallet",
  "/budget",
  "/transaction",
  "/portfolio",
  "/live",
  "/job"
];

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === "/login";
  const isRoot = pathname === "/";
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((route) =>
    pathname.startsWith(route),
  );
  const isLiveRoute = pathname.startsWith("/live");
  const isJobRoute = pathname.startsWith("/job");

  if (isRoot) {
    if (user) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && isLiveRoute && user.id !== LIVE_ACCESS_USER_ID) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (user && isJobRoute && user.id !== JOB_ACCESS_USER_ID) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/wallet",
    "/wallet/:path*",
    "/budget",
    "/budget/:path*",
    "/transaction",
    "/transaction/:path*",
    "/portfolio",
    "/portfolio/:path*",
    "/live",
    "/live/:path*",
    "/job",
    "/job/:path*",
    "/login",
  ],
};
