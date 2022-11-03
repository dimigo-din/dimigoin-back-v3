import cron from 'node-cron';
import logger from './logger';
import {
  refreshWeeklyTimetable,
} from './timetable';
import {
  notifyIngangAppliers, notifyMealMenu, notifyNewNotice,
} from './notifier';
import {
  resetExtraTimes,
  setConvenienceFood,
  convenienceDepriveCheck,
  fridayHomeCheck,
} from './dalgeurak';
import {
  updateMeal,
} from './meal';

const cronJobs = [
  {
    name: 'NEIS 시간표 갱신',
    schedule: '0 */2 * * *',
    action: async () => await refreshWeeklyTimetable(),
    runOnSetup: true,
  },
  {
    name: '달그락 세팅',
    schedule: '0 0 * * 1',
    action: async () => {
      await updateMeal();
      await setConvenienceFood();
      await convenienceDepriveCheck();
    },
    runOnSetup: false,
  },
  {
    name: '달그락 금요귀가자 체크',
    schedule: '0 1 * * 5',
    action: async () => {
      await fridayHomeCheck();
    },
    runOnSetup: false,
  },
  {
    name: '달그락 일시적 정보 초기화',
    schedule: '0 14,20 * * *',
    action: async () => {
      await resetExtraTimes();
    },
    runOnSetup: false,
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
  {
    name: '아침 급식 알림',
    schedule: '30 6 * * *',
    action: async () => await notifyMealMenu([1, 2, 3], 'breakfast'),
    runOnSetup: false,
  },
  {
    name: '점심 급식 알림 (3학년)',
    schedule: '30 11 * * *',
    action: async () => await notifyMealMenu([3], 'lunch'),
    runOnSetup: false,
  },
  {
    name: '점심 급식 알림 (1학년, 2학년)',
    schedule: '20 12 * * *',
    action: async () => await notifyMealMenu([1, 2], 'lunch'),
    runOnSetup: false,
  },
  {
    name: '저녁 급식 알림',
    schedule: '00 18 * * *',
    action: async () => await notifyMealMenu([1, 2, 3], 'dinner'),
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
