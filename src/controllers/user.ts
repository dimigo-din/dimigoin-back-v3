import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { UserModel } from '../models';
import { reloadAllUsers, attachStudentInfo } from '../resources/dimi-api';
import { getUserIdentity } from '../resources/user';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const users = await UserModel.find();
  res.json({ users });
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  let students = await UserModel.findStudents();
  const user = await getUserIdentity(req);
  if (user.userType === 'S') {
    students = students.map((student) => {
      student.photo = [];
      return student;
    });
  }
  res.json({ students });
};

export const getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
  const teachers = await UserModel.findTeachers();
  res.json({ teachers });
};

export const decodeJWT = async (req: Request, res: Response, next: NextFunction) => {
  const identity = await getUserIdentity(req);
  res.json({ identity });
};

export const reloadUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reloadAllUsers();
    await attachStudentInfo();
    res.end();
  } catch (error) {
    throw new HttpException(500, error.message);
  }
};
