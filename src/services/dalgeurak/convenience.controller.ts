import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  getTodayDateString,
  getWeekStartString,
} from '../../resources/date';
import { setConvenienceFood } from '../../resources/dalgeurak';
import { HttpException } from '../../exceptions';
import { ConvenienceApplicationModel, ConvenienceDepriveModel, ConvenienceFoodModel } from '../../models/dalgeurak';

export const createConvenience = async (req: Request, res: Response) => {
  await setConvenienceFood();
  res.json({});
};

export const convenienceAppli = async (req: Request, res: Response) => {
  const { time, food } = req.body;

  // 신청시간 체크
  const applicationEndCheck = await ConvenienceFoodModel.findOne({
    'duration.start': getWeekStartString(),
    'duration.applicationend': {
      $gte: getTodayDateString(),
    },
  });
  if (!applicationEndCheck) throw new HttpException(401, '신청기간이 아닙니다.');

  // 신청 인원 체크
  const convenience = await ConvenienceFoodModel.findOne({
    food,
    time,
    'duration.start': getWeekStartString(),
  });
  if (!convenience) throw new HttpException(401, '신청하려는 간편식이 존재하지 않습니다.');
  if (convenience.remain <= 0) throw new HttpException(401, '신청이 마감되었습니다.');

  // 신청박탈 체크
  const depriveCheck = await ConvenienceDepriveModel.findOne({
    student: new ObjectId(req.user._id),
  });
  if (depriveCheck) {
    await ConvenienceDepriveModel.updateOne(
      { student: new ObjectId(req.user._id) },
      { clear: true },
    );
    throw new HttpException(401, '신청이 취소되었습니다.\n사유 : 저번 간편식 2회이상 체크인하지 않음');
  }

  // 신청 했는지 체크
  const application = await ConvenienceApplicationModel.findOne({
    student: new ObjectId(req.user._id),
    date: {
      $gte: getWeekStartString(), // 신청시간부터
      $lte: getTodayDateString(), // 오늘날짜까지
    },
  });
  if (application) throw new HttpException(401, '이미 신청하였습니다.');

  await ConvenienceApplicationModel.create({
    student: req.user._id,
    date: getTodayDateString(),
    food: convenience._id,
  });

  res.json({
    result: 'success',
    time,
    food,
  });
};
