import cron from 'node-cron';
import { refreshWeeklyTimetable } from './timetable';
import {
  reloadAllUsers,
  attachStudentInfo,
} from './dimi-api';

export const setCronJobsAndRun = async () => {
  const cronJobs = [
    { schedule: '0 */2 * * *', action: refreshWeeklyTimetable },
    { schedule: '0 0 * * *', action: async () => {
      await reloadAllUsers();
      await attachStudentInfo();
    } },
  ];
  
  for (const { schedule, action } of cronJobs) {
    await action();
    cron.schedule(schedule, action);
  }
};
