import { Request, Response } from 'express';
import { UserModel } from '../../models';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserModel.find();
  res.json({ users });
};

export const getAllStudents = async (req: Request, res: Response) => {
  const students = await UserModel.findStudents();
  res.json({ students });
};

export const getAllTeachers = async (req: Request, res: Response) => {
  const teachers = await UserModel.findTeachers();
  res.json({ teachers });
};

export const decodeJWT = async (req: Request, res: Response) => {
  const identity = req.user;
  res.json({ identity });
};
