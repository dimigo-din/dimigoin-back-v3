import { Request, Response } from 'express';
import { WasherModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getAllWashers = async (req: Request, res: Response) => {
  const washers = await WasherModel.find({});

  res.json({ washers });
};

export const createWasher = async (req: Request, res: Response) => {
  const { name, gender } = req.body;

  const existingWasher = await WasherModel.findOne({ name, gender });
  if (existingWasher) {
    throw new HttpException(400, '이미 해당 세탁기가 존재합니다.');
  }

  const timetable = Array(7).fill({});
  const washer = await WasherModel.create({ ...req.body, timetable });
  res.json({ washer });
};

export const getAvailableWashers = async (req: Request, res: Response) => {
  const { gender } = req.body;
  const washers = await WasherModel.find({ gender });

  res.json({ washers });
};

export const applyLaundry = async (req: Request, res: Response) => {
  const {
    // eslint-disable-next-line camelcase
    gender, grade, user_id, name,
  } = req.user;
  const { applyTime, washerName } = req.body;

  const washer = await WasherModel.findOne({ name: washerName });
  if (!washer) throw new HttpException(404, '세탁기가 존재하지 않습니다.');
  if (washer.gender !== gender) throw new HttpException(404, '성별에 맞는 기숙사인지 다시 확인해주세요.');
  if (!washer.grade.includes(grade)) throw new HttpException(404, '신청 가능한 학년이 아닙니다.');

  const isWeekend = new Date().getDay() % 6 === 0;
  const maxApplyTime = isWeekend ? 7 : 5; // 평일에 5타임, 주말에 7타임

  if (applyTime < maxApplyTime) {
    if (washer.timetable[applyTime].name) throw new HttpException(404, '이미 예약되어 있는 시간대입니다.');
    washer.timetable[applyTime] = {
      userId: user_id, grade, class: req.user.class, name,
    };
  }
  else throw new HttpException(404, '신청 가능한 시간이 아닙니다.');

  await washer.save();
  res.json({ error: false });
};

export const editGrade = async (req: Request, res: Response) => {
  const { washerName, grade } = req.body;

  const washer = await WasherModel.findOne({ name: washerName });
  washer.grade = grade;
  washer.save();

  res.json({ error: false });
};
