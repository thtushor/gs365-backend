import { scheduleVexoraPayinQueryJob } from "./queryVexoraPayin";

export const initCronJobs = () => {
    console.log("[CRON] Initializing all cron jobs...");
    scheduleVexoraPayinQueryJob();
};
