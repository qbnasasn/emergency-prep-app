import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Protect dashboard routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// Identify API routes
const isApiRoute = createRouteMatcher(['/api/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 1. If it's a protected dashboard route, enforce auth (redirects to login)
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 2. If it's an API route and user is NOT logged in, return JSON 401
  // (Prevents the "HTML in JSON" crash)
  if (isApiRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
