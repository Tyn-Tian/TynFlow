import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

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

  const isLoginPage = req.nextUrl.pathname === "/login";
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = req.nextUrl.pathname === "/";

  if (isRoot) {
    if (user) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/dashboard", "/login"],
};
