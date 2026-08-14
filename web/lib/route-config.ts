// Forces Next.js to treat all API routes as dynamic (server-side only)
// This prevents build-time static analysis from instantiating Prisma
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
