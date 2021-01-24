import cron from 'node-cron';
import { refreshWeeklyTimetable } from './timetable';

export const setCronJobs = async () => {
  cron.schedule('0 */2 * * *', refreshWeeklyTimetable);
};
