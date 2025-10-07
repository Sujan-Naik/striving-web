import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    // Define protected paths (routes only for logged-in users)
    const protectedPaths = ['/llm', '/github', '/sign-out'];
    if (protectedPaths.includes(req.nextUrl.pathname)) {
      const newUrl = new URL("/login", req.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }
  }
  // Optional: Redirect logged-in users from /login to / (not specified, but common)
  // if (req.auth && req.nextUrl.pathname === "/login") {
  //   return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  // }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};