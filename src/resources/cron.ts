import cron from 'node-cron';
import { refreshWeeklyTimetable } from './timetable';
import {
  notifyIngangAppliers,
} from './notifier';
import {
  reloadAllUsers,
  attachStudentInfo,
} from './dimi-api';

const cronJobs = [
  {
    schedule: '0 */2 * * *',
    action: refreshWeeklyTimetable,
    runOnSetup: true,
  },
  {
    schedule: '0 0 * * *',
    action: async () => {
      await reloadAllUsers();
      await attachStudentInfo();
    },
    runOnSetup: true,
  },
  // 인강실 신청자 알림 (1타임)
  {
    schedule: '35 19 * * 1-5',
    action: async () => await notifyIngangAppliers('NSS1'),
    runOnSetup: false,
  },
  // 인강실 신청자 알림 (2타임)
  {
    schedule: '15 21 * * 1-5',
    action: async () => await notifyIngangAppliers('NSS2'),
    runOnSetup: false,
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
