import { Request, Response } from 'express';
import { getOrder } from '../../resources/dalgeurak';
import { HttpException } from '../../exceptions';
import { MealOrderModel } from '../../models/dalgeurak';
import { DGLsendPushMessage } from '../../resources/dalgeurakPush';
import { getExtraTime } from '../../resources/date';

export const editExtraTime = async (req: Request, res: Response) => {
  const { extraMinute } = req.body;
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute });

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  const { gradeIdx, classIdx, now } = await getOrder();

  for (let i = gradeIdx; i >= 0; i -= 1) {
    await DGLsendPushMessage(
      {
        grade: gradeIdx + 1,
        class: { $in: i === gradeIdx ? mealSequences[now][i].splice(classIdx + 1, mealSequences[now][i].length - 1) : mealSequences[now][i] },
      },
      '급식 지연 알림',
      `급식 시간이 ${extraMinute}분 지연되었습니다.`,
    );
  }

  res.json({ extraMinute });
};
export const getMealExtraTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const { extraMinute } = await MealOrderModel.findOne({ field: 'intervalTime' });

  const extraLunch = mealTimes.lunch.map((grade: number[]) => grade.map((time: number) => getExtraTime(extraMinute, time)));
  const extraDinner = mealTimes.dinner.map((grade: number[]) => grade.map((time: number) => getExtraTime(extraMinute, time)));

  res.json({
    extraLunch,
    extraDinner,
    extraMinute,
  });
};
