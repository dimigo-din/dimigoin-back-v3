import cron from 'node-cron';
import { refreshWeeklyTimetable } from './timetable';
import {
  reloadAllUsers,
  attachStudentInfo,
} from './dimi-api';

const cronJobs = [
  {
    schedule: '0 */2 * * *',
    action: refreshWeeklyTimetable,
  },
  {
    schedule: '0 0 * * *',
    action: async () => {
      await reloadAllUsers();
      await attachStudentInfo();
    },
  },
];

export const setCronJobs = async () => {
  for (const { schedule, action } of cronJobs) {
    cron.schedule(schedule, action);
  }
};

export const manuallyRunCronJobs = async () => {
  for (const { action } of cronJobs) {
    await action();
  }
};

export const setCronJobsAndRun = async () => {
  await setCronJobs();
  await manuallyRunCronJobs();
};
