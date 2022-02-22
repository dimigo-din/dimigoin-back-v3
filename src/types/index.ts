import { NextFunction, Request, Response } from 'express';

export enum ConfigKeys {
  circlePeriod = 'CIRCLE_PERIOD',
  circleMaxApply = 'CIRCLE_MAX_APPLY',
  imageExtension = 'IMAGE_EXTENSION',
  weeklyIngangTicketCount = 'WEEKLY_INGANG_TICKET_COUNT',
  ingangMaxApplicationPerClass = 'INGANG_MAX_APPLICATION_PER_CLASS',
  ingangApplyPeriod = 'INGANG_APPLY_PERIOD',
  mentoringApplyPeriod = 'MENTORING_APPLY_PERIOD',
  selfStudyTimes = 'SELF_STUDY_TIMES',
  isMovingClassSystem = 'IS_MOVING_CLASS_SYSTEM',
  mealTimes = 'MEAL_TIMES',
  afterschoolApplyPeriod = 'AFTERSCHOOL_APPLY_PERIOD',
}

export enum CirclePeriod {
  submitting = 'SUBMITTING',
  registering = 'REGISTERING',
  application = 'APPLICATION',
  screening = 'SCREENING',
  interview = 'INTERVIEW',
  final = 'FINAL',
}

export enum OutgoRequestStatus {
  applied = 'APPLIED',
  rejected = 'REJECTED',
  approved = 'APPROVED',
}

export enum PlaceType {
  classroom = 'CLASSROOM',
  restroom = 'RESTROOM',
  circle = 'CIRCLE',
  afterschool = 'AFTERSCHOOL',
  teacher = 'TEACHER',
  corridor = 'CORRIDOR',
  farm = 'FARM',
  playground = 'PLAYGROUND',
  gym = 'GYM',
  laundry = 'LAUNDRY',
  absent = 'ABSENT',
  etc = 'ETC'
}
export enum PlaceBuildingType {
  main = 'MAIN',
  newbuilding = 'NEWBUILDING',
  hakbong = 'HAKBONG',
  ujeong = 'UJEONG',
  etc = 'ETC'
}

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export const DayValues = ['mon', 'tue', 'wed', 'thr', 'fri', 'sat', 'sun'] as const;
export type Day = typeof DayValues[number];

export const GenderValues = ['M', 'F'] as const;
export type Gender = typeof GenderValues[number];

export const UserTypeValues = ['S', 'G', 'O', 'D', 'T', 'P'] as const;
export type UserType = typeof UserTypeValues[number];

export const GradeValues = [1, 2, 3] as const;
export type Grade = typeof GradeValues[number];

export const ClassValues = [1, 2, 3, 4, 5, 6] as const;
export type Class = typeof ClassValues[number];

export const CircleApplicationStatusValues = ['applied', 'document-fail', 'document-pass', 'interview-fail', 'interview-pass', 'final'] as const;
// 지원 완료 | 서류 탈락 | 서류 합격 | 면접 탈락 | 면접 합격 | 최종 선택
export type CircleApplicationStatus =
  typeof CircleApplicationStatusValues[number];

export const AfterschoolTimeValues = ['AFSC1', 'AFSC2'] as const; // AFter SChool
export type AfterschoolTime = typeof AfterschoolTimeValues[number];

export const WeekendTimeValues = ['WEDT1', 'WEDT2'] as const; // WeekEnd Day Time
export type WeekendTime = typeof WeekendTimeValues[number];

export const NightTimeValues = ['NSS1', 'NSS2'] as const; // Night Self Study
export type NightTime = typeof NightTimeValues[number];

export const TimeValues = [
  ...AfterschoolTimeValues,
  ...NightTimeValues,
  ...WeekendTimeValues,
] as const;
export type Time = typeof TimeValues[number];

export const TokenTypeValues = ['REFRESH', 'ACCESS'];
export type TokenType = typeof TokenTypeValues[number];

export type Middleware =
  (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const MealExceptionValues = ['first', 'last'];

export const MealStatusValues = ['onTime', 'tardy', 'empty'] as const;
export type MealStatusType = typeof MealStatusValues[number];

export const MealOrderValues = ['sequences', 'times', 'intervalTime'] as const;
