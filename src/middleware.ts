import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const cookies = getSessionCookie(request);
  console.log("Cookies:", cookies);
  if (!cookies) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/brands", "/products", "/users", "/posts"], // Apply middleware to specific routes
};
