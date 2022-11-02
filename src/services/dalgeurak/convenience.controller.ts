/* eslint-disable camelcase */
import { Request, Response } from 'express';
import { getStudentInfo, studentSearch } from '../../resources/dimi-api';
import {
  getConvTime,
  getDayCode,
  getLastWeek,
  getNowTime,
  getTodayDateString,
  getWeekdayEndString,
  getWeekStartString,
} from '../../resources/date';
import { setConvenienceFood } from '../../resources/dalgeurak';
import { HttpException } from '../../exceptions';
import {
  ConvenienceCheckinModel,
  ConvenienceDepriveModel,
  ConvenienceFoodModel,
  FriDayHomeModel,
} from '../../models/dalgeurak';
import { ConvenienceFoodType } from '../../types';

export const createConvenience = async (req: Request, res: Response) => {
  await setConvenienceFood();
  res.json({});
};

export const getConvenience = async (req: Request, res: Response) => {
  const convenience = await ConvenienceFoodModel.find({
    'duration.start': getWeekStartString(),
  })
    .select('time')
    .select('limit')
    .select('remain')
    .select('food')
    .select('name')
    .select('duration');
  if (!convenience) throw new HttpException(501, '간편식이 없습니다.');

  res.json({ convenience });
};

// 체크인
export const checkIn = async (req: Request, res: Response) => {
  const { sid } = req.body;

  // 조식/석식 시간 체크
  const nowTime = getConvTime();
  if (!nowTime) throw new HttpException(401, '식사시간이 아닙니다.');

  const conveniences = await ConvenienceFoodModel.find({
    time: nowTime,
    'duration.start': getLastWeek(getWeekStartString()),
  });
  if (!conveniences) throw new HttpException(501, '체크인하려는 간편식이 존재하지 않습니다.');

  // 신청 여부 체크
  let applicationStatus = false;
  conveniences.forEach((convenience) => {
    const application = convenience.applications.map((e) => e.student);
    if (application.includes(sid)) applicationStatus = true;
  });
  if (!applicationStatus) throw new HttpException(401, '신청하지 않았습니다.');

  // 체크인 확인했는지 체크
  const checkInCheck = await ConvenienceCheckinModel.findOne({
    'duration.start': getWeekStartString(),
  });
  if (!checkInCheck) throw new HttpException(501, '이번 주 체크인이 설정되어 있지 않습니다.');
  checkInCheck[nowTime].forEach((e) => {
    if (e.date === getTodayDateString() && e.student === sid) {
      throw new HttpException(401, '이미 체크인 하였습니다.');
    }
  });

  Object.assign(checkInCheck, {
    [nowTime]: [...checkInCheck[nowTime], {
      date: getTodayDateString(),
      student: sid,
    }],
  });
  await checkInCheck.save();

  res.json({
    result: 'success',
    time: nowTime,
  });
};

export const convenienceAppli = async (req: Request, res: Response) => {
  const { time, food } = req.body;

  // 신청 인원 체크
  const convenience = await ConvenienceFoodModel.findOne({
    food,
    time,
    'duration.start': getWeekStartString(),
    'duration.applicationend': {
      $gte: getTodayDateString(),
    },
  });
  if (!convenience) throw new HttpException(401, '신청하려는 시간대의 간편식이 없습니다.');
  if (convenience.remain <= 0) throw new HttpException(401, '신청이 마감되었습니다.');

  const today = getDayCode();
  if (!['tue', 'wed'].includes(today)) throw new HttpException(401, '신청할 수 있는 날이 아닙니다.');

  const nowTime = getNowTime();
  if (
    !(today === 'tue' && nowTime >= 700)
    && !(today === 'wed' && nowTime <= 1900)
  ) throw new HttpException(401, '신청할 수 있는 시간이 아닙니다.');

  // 신청 했는지 체크
  const application = convenience.applications.map((e) => e.student);
  if (application.includes(req.user.user_id)) throw new HttpException(401, '이미 신청하였습니다.');

  const allConvApplilcationCheck = await ConvenienceFoodModel.find({
    applications: {
      $elemMatch: {
        student: req.user.user_id,
      },
    },
    'duration.start': getWeekStartString(),
  });
  if (allConvApplilcationCheck) { allConvApplilcationCheck.forEach((e) => {
    if (e.time === time) throw new HttpException(401, '이미 신청하였습니다.');
  }); }

  // 월요일 학년 별 17명 이상 신청 막기
  const startWeek = getWeekStartString();
  const students = convenience.applications
    .map((e) => e.date === startWeek && e.student)
    .filter((e) => e);
  const gradeCnt = (
    students.length > 1
      ? await studentSearch({
        user_id: students,
        grade: req.user.grade,
      }) : []
  ).length;
  if (gradeCnt >= 17) throw new HttpException(401, '학년별 신청이 마감되었습니다.');

  // 신청박탈 체크
  const depriveCheck = await ConvenienceDepriveModel.findOne({
    student: req.user.user_id,
  });
  if (depriveCheck) {
    await ConvenienceDepriveModel.updateOne(
      { student: req.user.user_id },
      { clear: true },
    );
    throw new HttpException(401, '신청이 취소되었습니다.\n사유 : 저번 간편식 2회이상 체크인하지 않음');
  }

  Object.assign(convenience, {
    remain: convenience.limit - (convenience.applications.length + 1),
    applications: [
      ...convenience.applications,
      {
        date: getTodayDateString(),
        student: req.user.user_id,
      },
    ],
  });
  await convenience.save();

  res.json({
    result: 'success',
    time,
    food,
  });
};

export const getUserList = async (req: Request, res: Response) => {
  type ul = {
    [key in ConvenienceFoodType]: Array<{
      user_id: number;
      name: string;
      serial: string;
      grade: number;
      class: number;
      checkin: boolean;
    }>;
  };

  // const nowTime = getConvTime();
  // if (!nowTime) throw new HttpException(401, '식사시간이 아닙니다.');

  const nowTime = 'dinner';
  const conveniences = await ConvenienceFoodModel.find({
    time: nowTime,
    'duration.start': getLastWeek(getWeekStartString()),
  });
  if (!conveniences) throw new HttpException(501, '체크인하려는 간편식이 존재하지 않습니다.');

  const userList: ul = {
    sandwich: [],
    misu: [],
    salad: [],
  };

  for (const food of conveniences) {
    for (const { student } of food.applications) {
      const {
        user_id,
        name,
        serial,
        grade,
        class: kclass,
      } = await getStudentInfo(student);
      const checkin = await ConvenienceCheckinModel.findOne({
        'duration.start': getWeekStartString(),
        [nowTime]: {
          $elemMatch: {
            date: getTodayDateString(),
            student: user_id,
          },
        },
      });
      userList[food.food].push({
        user_id,
        name,
        serial,
        grade,
        class: kclass,
        checkin: !!checkin,
      });
    }
  }
  res.json({ ...userList });
};

export const getMyConvenienceAppli = async (req: Request, res: Response) => {
  const conveniences = await ConvenienceFoodModel.find({
    'duration.start': {
      $gte: getLastWeek(getWeekStartString()),
      $lte: getWeekStartString(),
    },
    applications: {
      $elemMatch: {
        student: req.user.user_id,
      },
    },
  })
    .select('duration')
    .select('time')
    .select('food');

  res.json({ conveniences });
};

export const friRegistry = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const date = getWeekdayEndString();

  const friHome = await FriDayHomeModel.findOne({
    userId: sid,
    date,
  });
  if (friHome) throw new HttpException(401, '이미 신청되었습니다.');

  await new FriDayHomeModel({
    userId: sid,
    date,
  }).save();

  res.json({ date });
};
