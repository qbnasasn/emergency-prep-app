import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

// Protect dashboard routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// Identify API routes
const isApiRoute = createRouteMatcher(['/api/(.*)']);

export default clerkMiddleware(async (auth: any, req: NextRequest) => {
  // 1. Handle CORS preflight OPTIONS for API routes
  if (isApiRoute(req) && req.method === 'OPTIONS') {
    const preflight = new Response(null, { status: 200 });
    preflight.headers.set('Access-Control-Allow-Origin', '*');
    preflight.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    preflight.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return preflight;
  }

  // 2. Enforce auth for protected dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 3. Enforce auth for API routes (return 401 if not logged in)
  if (isApiRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const unauthorized = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      unauthorized.headers.set('Access-Control-Allow-Origin', '*');
      unauthorized.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      unauthorized.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      return unauthorized;
    }
  }

  // 4. For all other requests, continue and add CORS headers to the response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
