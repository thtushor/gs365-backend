export interface ICronJob {
    /**
     * The name of the cron job for logging purposes.
     */
    name: string;

    /**
     * The cron schedule pattern (e.g., "* * * * *" for every minute).
     */
    schedule: string;

    /**
     * The async function that executes the cron job logic.
     */
    execute: () => Promise<void>;
}
