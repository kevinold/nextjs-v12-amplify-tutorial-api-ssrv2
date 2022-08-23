import { NextResponse } from "next/server";

export function middleware(request) {
  return NextResponse.redirect(new URL("/about-2", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/about/:path*",
};
