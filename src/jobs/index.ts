import cron from "node-cron";
import { ICronJob } from "./types";
import { vexoraPayinQueryJob } from "./vexoraPayinQuery.job";

const jobs: ICronJob[] = [
    vexoraPayinQueryJob,
    // Add additional jobs here over time
];

export const initCronJobs = () => {
    console.log("[CRON] Initializing all cron jobs...");

    for (const job of jobs) {
        cron.schedule(job.schedule, async () => {
            try {
                await job.execute();
            } catch (error) {
                console.error(`[CRON] Unhandled error in job '${job.name}':`, error);
            }
        });
        console.log(`[CRON] Scheduled '${job.name}' with pattern: '${job.schedule}'`);
    }
};
