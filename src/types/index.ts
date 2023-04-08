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
  tokenVersion = 'TOKEN_VERSION',
}
export enum MealConfigKeys {
  waitingLine = 'WAITING_LINE',
  intervalTime = 'INTERVAL_TIME',
  stayMealPrice = 'STAY_MEAL_PRICE',
  firstMealMaxApplicationPerMeal = 'FIRST_MEAL_MAX_APPLICATION_PER_MEAL',
  lastMealMaxApplicationPerMeal = 'LAST_MEAL_MAX_APPLICATION_PER_MEAL',
  mealExceptionApplicationCount = 'MEAL_EXCEPTION_APPLICATION_COUNT',
  convenienceApplicationLimit = 'CONVENIENCE_APPLICATION_LIMIT',
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
  etc = 'ETC',
}
export enum PlaceBuildingType {
  main = 'MAIN',
  newbuilding = 'NEWBUILDING',
  hakbong = 'HAKBONG',
  ujeong = 'UJEONG',
  etc = 'ETC',
}

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export const DayValues = [
  'mon',
  'tue',
  'wed',
  'thr',
  'fri',
  'sat',
  'sun',
] as const;
export type Day = typeof DayValues[number];

export const GenderValues = ['M', 'F'] as const;
export type Gender = typeof GenderValues[number];

export const UserTypeValues = ['S', 'G', 'O', 'D', 'T', 'P'] as const;
export type UserType = typeof UserTypeValues[number];

export const OutgoRequestValues = ['A', 'W', 'D'] as const; // APPROVED, WAITING, DENIED
export type OutgoRequestType = typeof OutgoRequestValues[number];

export const GradeValues = [1, 2, 3] as const;
export type Grade = typeof GradeValues[number];

export const ClassValues = [1, 2, 3, 4, 5, 6] as const;
export type Class = typeof ClassValues[number];

export const WasherValues = ['F1', 'F2', 'F3', 'M2L', 'M2M', 'M2R', 'M4L', 'M4R', 'M5'] as const; // Ex: Female-1층 = F1, Male-2층-오른쪽 = M2R
export type Washer = typeof WasherValues[number];

// to-do: 세탁기 사용시간 Array 만들기
// export const WasherTimes = []

export const CircleApplicationStatusValues = [
  'applied',
  'document-fail',
  'document-pass',
  'interview-fail',
  'interview-pass',
  'final',
] as const;
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

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const MealExceptionValues = ['first', 'last'];
export type MealExceptionType = typeof MealExceptionValues[number];

export const MealExceptionApplicationStatusValues = [
  'waiting',
  'approve',
  'reject',
] as const;
export type MealExceptionApplicationStatus =
  typeof MealExceptionApplicationStatusValues[number];

export const MealCancelApplicationStatusValues = [
  'teacherWaiting', // 담임 신청 대기
  'aramarkWaiting', // 급식실 신청 대기
  'approve',
  'reject',
] as const;
export type MealCancelApplicationStatus =
  typeof MealCancelApplicationStatusValues[number];

export const MealStatusValues = ['onTime', 'tardy', 'empty'] as const;
export type MealStatusType = typeof MealStatusValues[number];

export const MealOrderValues = [
  'sequences',
  'times',
] as const;

export const MealTardyStatusValues = [
  'onTime',
  'tardy',
  'empty',
  'beforeLunch',
  'beforeDinner',
  'afterDinner',
  'certified',
  'early',
  'rejected',
  'waiting',
] as const;
export type MealTardyStatusType = typeof MealTardyStatusValues[number];

export const MealTimeValues = ['breakfast', 'lunch', 'dinner'] as const;
export type MealTimeType = typeof MealTimeValues[number];

export const MealExceptionTimeValues = ['lunch', 'dinner'] as const;
export type MealExceptionTimeType = typeof MealExceptionTimeValues[number];

export type ClassType = [number, number, number, number, number, number];

export const WarningValues = [
  'tardy',
  'abuse',
  'useHallway',
  'ignoreSequence',
  'etc',
] as const;

export const ConvenienceTimeValues = ['breakfast', 'dinner'] as const;
export type ConvenienceTimeType = typeof ConvenienceTimeValues[number];

export const ConvenienceFoodValues = ['sandwich', 'salad', 'misu'] as const;
export type ConvenienceFoodType = typeof ConvenienceFoodValues[number];

export const aramark = 'aramark';
