// Runs once when a Next.js server starts, before it answers any request.
export async function register() {
  // In development, a stopped local database must not turn every page into a 500.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development") {
    const { skipUnreachableDatabase } = await import("./lib/dev-database");
    await skipUnreachableDatabase();
  }
}
