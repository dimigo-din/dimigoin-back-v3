import { Request, Response } from 'express';
import { WasherModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getAllWashers = async (req: Request, res: Response) => {
  const washers = await WasherModel.find({});

  res.json({ washers });
};

export const createWasher = async (req: Request, res: Response) => {
  const notExist = await WasherModel.findOne({
    name: req.body.name,
    gender: req.body.gender,
  });

  if (!notExist) throw new HttpException(404, '이미 해당 세탁기가 존재합니다.');

  const washer = await new WasherModel({
    ...(req.body),
    weekDayTimetable: [],
    weekEndTimetable: [],
  }).save();

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

  if (washer.gender !== gender) throw new HttpException(404, '성별에 맞는 기숙사인지 다시 확인해주세요.');
  if (!washer.grade.includes(grade)) throw new HttpException(404, '신청 가능한 학년이 아닙니다.');

  const date = new Date();
  const day = date.getDay();

  if (day % 6 !== 0) {
    if (washer.weekDayTimetable[applyTime].userIdx) throw new HttpException(404, '이미 예약되어 있는 시간대입니다.');

    const obj = {
      userIdx: user_id, grade, class: req.user.class, name,
    };

    Object.assign(washer.weekDayTimetable[applyTime], obj);
  } else {
    if (washer.weekEndTimetable[applyTime].userIdx) throw new HttpException(404, '이미 예약되어 있는 시간대입니다.');

    const obj = {
      userIdx: user_id, grade, class: req.user.class, name,
    };

    Object.assign(washer.weekEndTimetable[applyTime], obj);
  }

  await washer.save();
  res.json({ error: false, message: 'Success' });
};

export const editGrade = async (req: Request, res: Response) => {
  const { washerName, grade } = req.body;

  const washer = await WasherModel.findOne({ name: washerName });
  washer.grade = grade;
  washer.save();

  res.json({ error: false, message: 'Success' });
};
