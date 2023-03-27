import { sendPushMessage } from './push';
import { MealModel, NoticeModel } from '../models';
import { Grade } from '../types';
import { getTodayDateString } from './date';

export const notifyNewNotice = async () => {
  const today = getTodayDateString();
  const todayNotices = await NoticeModel.find({
    startDate: today,
  });
  for (const notice of todayNotices) {
    await sendPushMessage(
      { grade: notice.targetGrade },
      '새로운 공지사항이 등록되었어요!',
      `[${notice.title}]\n${notice.content}`,
    );
  }
};

type MealTime = 'breakfast' | 'lunch' | 'dinner';
const mealString = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
};

export const notifyMealMenu = async (targetGrades: Grade[], time: MealTime) => {
  const today = getTodayDateString();
  const meal = await MealModel.findOne({ date: today });
  if (!meal) return;
  if (!(time as string in meal)) return;
  if (meal[time].length === 0) return;
  if (meal[time].toString() === '급식 정보가 없습니다.') return;
  await sendPushMessage(
    { grade: targetGrades },
    `오늘의 ${mealString[time]} 메뉴를 확인하세요!`,
    meal[time].toString(),
  );
};
