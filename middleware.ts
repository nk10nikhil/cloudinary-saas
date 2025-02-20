import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'; // Importing necessary functions from Clerk's Next.js server package
import { NextResponse } from 'next/server'; // Importing NextResponse from Next.js server package

const isPublicRoute = createRouteMatcher([ // Creating a route matcher for public routes
    "/sign-in", // Public route for sign-in
    "/sign-up", // Public route for sign-up
    "/", // Public route for the root path
    "/home" // Public route for home
]);

const isPublicApiRoute = createRouteMatcher([ // Creating a route matcher for public API routes
    "/api/videos" // Public API route for videos
]);

export default clerkMiddleware(async (auth, req) => { // Exporting the default middleware function using Clerk's middleware
    const { userId } = await auth(); // Authenticating the user and getting the userId
    const currentUrl = new URL(req.url); // Creating a URL object from the request URL
    const isAccessingDashboard = currentUrl.pathname === "/home"; // Checking if the user is accessing the dashboard
    const isApiRequest = currentUrl.pathname.startsWith("/api"); // Checking if the request is an API request

    // If user is logged in and accessing a public route but not the dashboard
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home", req.url)); // Redirect to the dashboard if logged in and accessing a public route
    }

    // If user is not logged in
    if (!userId) {
        // If user is not logged in and trying to access a protected route
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url)); // Redirect to sign-in if accessing a protected route
        }

        // If the request is for a protected API and the user is not logged in
        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url)); // Redirect to sign-in if accessing a protected API route
        }
    }

    return NextResponse.next(); // Proceed to the next middleware or route handler
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"], // Configuration for matching routes
};