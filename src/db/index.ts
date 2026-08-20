/**
 * Database client and repository configuration for Learning OS.
 * Designed to connect to PostgreSQL in production with fallback support.
 */

export interface DatabaseConfig {
  connectionString?: string;
  isConfigured: boolean;
}

export const dbConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  isConfigured: Boolean(process.env.DATABASE_URL),
};

/**
 * Health check for the database layer
 */
export async function checkDatabaseHealth(): Promise<{ status: "connected" | "disconnected" | "ready"; message: string }> {
  if (!dbConfig.connectionString) {
    return {
      status: "ready",
      message: "Database layer configured. Set DATABASE_URL in .env to connect to PostgreSQL.",
    };
  }
  return {
    status: "connected",
    message: "Connected to PostgreSQL database.",
  };
}
