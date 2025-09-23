import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Log for debugging (remove in production)
    console.log("Middleware running for:", req.nextUrl.pathname);
    console.log("Token exists:", !!req.nextauth.token);
    
    // If no token, redirect to login
    if (!req.nextauth.token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Log the token status
        console.log("Authorization check - Token:", !!token, "Path:", req.nextUrl.pathname);
        
        // For protected routes, require a token
        if (req.nextUrl.pathname.startsWith("/dashboard") ||
            req.nextUrl.pathname.startsWith("/create-profile") ||
            req.nextUrl.pathname.startsWith("/add-links")) {
          return !!token;
        }
        
        // Allow access to other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create-profile/:path*", 
    "/add-links/:path*",
  ],
};