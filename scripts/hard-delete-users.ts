#!/usr/bin/env tsx

/**
 * Hard Delete Users Script
 *
 * This script permanently deletes users whose accounts have been marked for deletion
 * for more than 30 days (configurable). This is part of the GDPR-compliant account
 * deletion process.
 *
 * Usage:
 *   npm run hard-delete-users
 *   npm run hard-delete-users -- --days=60
 *   npm run hard-delete-users -- --dry-run
 *
 * Environment Variables Required:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 *
 * Features:
 * - Configurable retention period (default: 30 days)
 * - Dry run mode for testing
 * - Comprehensive logging
 * - Audit trail of deleted users
 * - Error handling and recovery
 * - Rate limiting to avoid overwhelming the database
 */

import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/database.types";
import { UserService } from "../src/services/user.service";
import { UserProfile } from "../src/types/user.types";
import { log } from "../src/lib/logger";

interface ScriptOptions {
  days?: number;
  dryRun?: boolean;
  batchSize?: number;
  delayMs?: number;
}

interface DeletionStats {
  totalFound: number;
  totalDeleted: number;
  totalErrors: number;
  deletedUserIds: string[];
  errors: Array<{ userId: string; error: string }>;
}

class HardDeleteUsersScript {
  private supabase;
  private userService: UserService;
  private options: Required<ScriptOptions>;

  constructor(options: ScriptOptions = {}) {
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.userService = new UserService(this.supabase);

    this.options = {
      days: options.days ?? 30,
      dryRun: options.dryRun ?? false,
      batchSize: options.batchSize ?? 10,
      delayMs: options.delayMs ?? 1000,
    };
  }

  async run(): Promise<void> {
    const startTime = Date.now();
    log.info(
      {
        days: this.options.days,
        dryRun: this.options.dryRun,
        batchSize: this.options.batchSize,
      },
      "Starting hard delete users script"
    );

    try {
      const stats = await this.processDeletions();
      await this.logResults(stats, startTime);

      if (!this.options.dryRun && stats.totalDeleted > 0) {
        log.info(
          { deletedCount: stats.totalDeleted },
          "Hard deletion completed successfully"
        );
      } else if (this.options.dryRun) {
        log.info(
          { foundCount: stats.totalFound },
          "Dry run completed - no users were actually deleted"
        );
      } else {
        log.info("No users found for hard deletion");
      }
    } catch (error) {
      log.error(error, "Hard delete script failed");
      process.exit(1);
    }
  }

  private async processDeletions(): Promise<DeletionStats> {
    const stats: DeletionStats = {
      totalFound: 0,
      totalDeleted: 0,
      totalErrors: 0,
      deletedUserIds: [],
      errors: [],
    };

    // Get users marked for deletion
    const result = await this.userService.getUsersMarkedForDeletion(
      this.options.days
    );

    if (!result.success) {
      throw new Error(
        `Failed to fetch users marked for deletion: ${result.error}`
      );
    }

    const usersToDelete = result.data;
    stats.totalFound = usersToDelete.length;

    if (usersToDelete.length === 0) {
      log.info("No users found for hard deletion");
      return stats;
    }

    log.info(
      { count: usersToDelete.length, days: this.options.days },
      "Found users marked for hard deletion"
    );

    // Process users in batches
    for (let i = 0; i < usersToDelete.length; i += this.options.batchSize) {
      const batch = usersToDelete.slice(i, i + this.options.batchSize);

      log.info(
        {
          batch: Math.floor(i / this.options.batchSize) + 1,
          totalBatches: Math.ceil(
            usersToDelete.length / this.options.batchSize
          ),
          batchSize: batch.length,
        },
        "Processing batch"
      );

      await this.processBatch(batch, stats);

      // Add delay between batches to avoid overwhelming the database
      if (i + this.options.batchSize < usersToDelete.length) {
        await this.delay(this.options.delayMs);
      }
    }

    return stats;
  }

  private async processBatch(
    users: UserProfile[],
    stats: DeletionStats
  ): Promise<void> {
    for (const user of users) {
      try {
        if (this.options.dryRun) {
          log.info(
            {
              userId: user.id,
              email: user.email,
              deletedAt: user.deleted_at,
            },
            "[DRY RUN] Would hard delete user"
          );
          stats.totalDeleted++;
          stats.deletedUserIds.push(user.id);
        } else {
          // Perform hard deletion
          const deleteResult = await this.userService.deleteProfile(user.id);

          if (deleteResult.success) {
            log.info(
              {
                userId: user.id,
                email: user.email,
                deletedAt: user.deleted_at,
              },
              "Successfully hard deleted user"
            );
            stats.totalDeleted++;
            stats.deletedUserIds.push(user.id);
          } else {
            log.error(
              {
                userId: user.id,
                email: user.email,
                error: deleteResult.error,
              },
              "Failed to hard delete user"
            );
            stats.totalErrors++;
            stats.errors.push({
              userId: user.id,
              error: deleteResult.error,
            });
          }
        }
      } catch (error) {
        log.error(
          {
            userId: user.id,
            email: user.email,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          "Error processing user for hard deletion"
        );
        stats.totalErrors++;
        stats.errors.push({
          userId: user.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async logResults(
    stats: DeletionStats,
    startTime: number
  ): Promise<void> {
    const duration = Date.now() - startTime;

    const summary = {
      duration: `${duration}ms`,
      totalFound: stats.totalFound,
      totalDeleted: stats.totalDeleted,
      totalErrors: stats.totalErrors,
      dryRun: this.options.dryRun,
      days: this.options.days,
    };

    log.info(summary, "Hard delete script summary");

    // Log detailed results if there were deletions
    if (stats.totalDeleted > 0) {
      log.info(
        {
          deletedUserIds: stats.deletedUserIds,
          dryRun: this.options.dryRun,
        },
        "Deleted user IDs for audit trail"
      );
    }

    // Log errors if any
    if (stats.totalErrors > 0) {
      log.error(
        { errors: stats.errors },
        "Errors encountered during hard deletion"
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: ScriptOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith("--days=")) {
      const days = parseInt(arg.split("=")[1], 10);
      if (isNaN(days) || days < 1) {
        console.error("Invalid days value. Must be a positive integer.");
        process.exit(1);
      }
      options.days = days;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--batch-size=")) {
      const batchSize = parseInt(arg.split("=")[1], 10);
      if (isNaN(batchSize) || batchSize < 1) {
        console.error("Invalid batch-size value. Must be a positive integer.");
        process.exit(1);
      }
      options.batchSize = batchSize;
    } else if (arg.startsWith("--delay=")) {
      const delay = parseInt(arg.split("=")[1], 10);
      if (isNaN(delay) || delay < 0) {
        console.error("Invalid delay value. Must be a non-negative integer.");
        process.exit(1);
      }
      options.delayMs = delay;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Hard Delete Users Script

Usage:
  npm run hard-delete-users [options]

Options:
  --days=N          Retention period in days (default: 30)
  --dry-run         Show what would be deleted without actually deleting
  --batch-size=N    Number of users to process in each batch (default: 10)
  --delay=N         Delay between batches in milliseconds (default: 1000)
  --help, -h        Show this help message

Examples:
  npm run hard-delete-users
  npm run hard-delete-users -- --days=60
  npm run hard-delete-users -- --dry-run
  npm run hard-delete-users -- --days=30 --batch-size=5 --delay=2000

Environment Variables:
  SUPABASE_URL              - Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
      `);
      process.exit(0);
    }
  }

  try {
    const script = new HardDeleteUsersScript(options);
    await script.run();
  } catch (error) {
    console.error(
      "Script failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

export { HardDeleteUsersScript };
