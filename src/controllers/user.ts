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
  let users = await UserModel.find();
  const { userType } = await getUserIdentity(req);
  if (userType === 'S') users = users.map(redacter);
  res.json({ users: users.map(redacter) });
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  let students = await UserModel.findStudents();
  const { userType } = await getUserIdentity(req);
  if (userType === 'S') students = students.map(redacter);
  res.json({ students });
};

export const getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
  let teachers = await UserModel.findTeachers();
  const { userType } = await getUserIdentity(req);
  if (userType === 'S') teachers = teachers.map(redacter);
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
