import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/wallet",
  "/budget",
  "/transaction",
  "/scheduler",
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

  const { data } = await supabase.from("profiles").select("menu").eq("user_id", user?.id).single()

  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";
  const isResetPasswordPage = pathname === "/reset-password";
  const isRoot = pathname === "/";
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((route) =>
    pathname.startsWith(route),
  );

  if (isRoot) {
    if (user) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && isProtectedRoute) {
    const segment = pathname.split("/")[1];
    let menuName = segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "";

    if (segment === "transaction" || segment === "scheduler") {
      menuName = "Transaction";
    }

    const allowedMenu = data?.menu || [];

    if (!allowedMenu.includes(menuName) && segment !== "dashboard") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (user && isForgotPasswordPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (user && isResetPasswordPage) {
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
    "/forgot-password",
    "/reset-password"
  ],
};
