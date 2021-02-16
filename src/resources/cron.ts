import cron from 'node-cron';
import logger from './logger';
import {
  refreshWeeklyTimetable,
} from './timetable';
import {
  notifyIngangAppliers, notifyNewNotice,
} from './notifier';
import {
  reloadAllUsers,
  attachStudentInfo,
  attachTeacherInfo,
} from './dimi-api';

const cronJobs = [
  {
    name: 'NEIS 시간표 갱신',
    schedule: '0 */2 * * *',
    action: async () => await refreshWeeklyTimetable(),
    runOnSetup: true,
  },
  {
    name: '사용자 정보 및 학적 갱신',
    schedule: '0 0 * * 1',
    action: async () => {
      await reloadAllUsers();
      await attachStudentInfo();
      await attachTeacherInfo();
    },
    runOnSetup: true,
  },
  {
    name: '인강실 신청자 푸시 알림 (1타임)',
    schedule: '35 19 * * 1-5',
    action: async () => await notifyIngangAppliers('NSS1'),
    runOnSetup: false,
  },
  {
    name: '인강실 신청자 푸시 알림 (2타임)',
    schedule: '15 21 * * 1-5',
    action: async () => await notifyIngangAppliers('NSS2'),
    runOnSetup: false,
  },
  {
    name: '신규 공지사항 알림',
    schedule: '00 8 * * *',
    action: async () => await notifyNewNotice(),
    runOnSetup: false,
  },
].map((c) => ({
  ...c,
  action: async () => {
    try {
      await c.action();
      logger.info(`Successfully executed '${c.name}'`);
    } catch (error) {
      logger.error(`[${c.name}] ${error}`);
    }
  },
}));

export const setCronJobs = async () => {
  for (const { schedule, action } of cronJobs) {
    cron.schedule(schedule, action, {
      timezone: 'Asia/Seoul',
    });
  }
};

export const manuallyRunCronJobs = async (isSetup: boolean = false) => {
  for (const { action, runOnSetup } of cronJobs) {
    if (!isSetup || runOnSetup) await action();
  }
};

export const setCronJobsAndRun = async () => {
  await setCronJobs();
  await manuallyRunCronJobs(true);
};
