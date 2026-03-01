import cron from "node-cron";
import { ICronJob } from "./types";
import { vexoraPayinQueryJob } from "./vexoraPayinQuery.job";
import { vexoraPayoutQueryJob } from "./vexoraPayoutQuery.job";

const jobs: ICronJob[] = [
    vexoraPayinQueryJob,
    vexoraPayoutQueryJob,
    // Add additional jobs here over time
];

export const initCronJobs = () => {
    console.log("[CRON] Initializing all cron jobs...");

    for (const job of jobs) {
        cron.schedule(job.schedule, async () => {
            console.log(`[CRON] Starting execution of job '${job.name}'...`);
            try {
                await job.execute();
                console.log(`[CRON] Execution of job '${job.name}' completed successfully.`);
            } catch (error) {
                console.error(`[CRON] Unhandled error in job '${job.name}':`, error);
            }
        });
        console.log(`[CRON] Scheduled '${job.name}' with pattern: '${job.schedule}'`);
    }
};
