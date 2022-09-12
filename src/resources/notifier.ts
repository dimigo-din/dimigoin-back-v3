import { sendPushMessage } from './push';
import { IngangApplicationModel, MealModel, NoticeModel } from '../models';
import { Grade, NightTime } from '../types';
import { getTodayDateString } from './date';

const ingangPlace = [
  '신관 1층 영어 전용 교실',
  '본관 1층 비즈쿨실',
];

export const notifyIngangAppliers = async (time: NightTime) => {
  const applications = await IngangApplicationModel.find({
    date: getTodayDateString(),
    time,
  }).populateTs('applier');
  const applierIds = applications.map((a) => a.applier._id);

  for (let grade = 1; grade <= 2; grade += 1) {
    await sendPushMessage(
      { _id: { $in: applierIds }, grade },
      `신청하신 ${time.substr(-1)}타임 인강실에 갈 시간이에요!`,
      `${ingangPlace[grade - 1]}에 자습 시작 5분 전까지 착석해 주세요.`,
    );
  }
};

export const notifyNewNotice = async () => {
  const today = getTodayDateString();
  const todayNotices = await NoticeModel.find({
    startDate: today,
  });
  for (const notice of todayNotices) {
    await sendPushMessage(
      { grade: { $in: notice.targetGrade } },
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
    { grade: { $in: targetGrades } },
    `오늘의 ${mealString[time]} 메뉴를 확인하세요!`,
    meal[time].toString(),
  );
};
