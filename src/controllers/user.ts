import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { UserModel } from '../models';
import { reloadAllUsers, attachStudentInfo } from '../resources/dimi-api';
import { getUserIdentity } from '../resources/user';

const redacter = (user: any) => {
  user.photo = null;
  user.phone = null;
  return user;
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const users = await UserModel.find();
  res.json({ users: users.map(redacter) });
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  const students = await UserModel.findStudents();
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
    res.send('success');
  } catch (error) {
    throw new HttpException(500, error.message);
  }
};
