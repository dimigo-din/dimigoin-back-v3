import { NextFunction, Request, Response } from 'express';

export enum ConfigKeys {
  circlePeriod = 'CIRCLE_PERIOD',
  circleMaxApply = 'CIRCLE_MAX_APPLY',
  circleCategory = 'CIRCLE_CATEGORY',
  imageExtension = 'IMAGE_EXTENSION',
  bucketURL = 'AWS_BUCKET_URL',
}

export enum CirclePeriod {
  application = 'APPLICATION',
  interview = 'INTERVIEW',
  final = 'FINAL',
}

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

export const IngangTimeValues = [1, 2] as const;
export type IngangTime = typeof IngangTimeValues[number];

export type Middleware =
  (req: Request, res: Response, next: NextFunction) => Promise<void>
