import { NextFunction, Request, Response } from 'express';

export const GenderValues = ['M', 'F'] as const;
export type Gender = typeof GenderValues[number];

export const UserTypeValues = ['S', 'O', 'D', 'T', 'P'] as const;
export type UserType = typeof UserTypeValues[number];

export const GradeValues = [1, 2, 3] as const;
export type Grade = typeof GradeValues[number];

export const ClassValues = [1, 2, 3, 4, 5, 6] as const;
export type Class = typeof ClassValues[number];

export type Middleware =
  (req: Request, res: Response, next: NextFunction) => Promise<void>;
