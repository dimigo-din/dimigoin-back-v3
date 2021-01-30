import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import * as User from '../../models/user';
import { reloadAllUsers, attachStudentInfo } from '../../resources/dimi-api';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.model.find();
  res.json({ users });
};

export const getAllStudents = async (req: Request, res: Response) => {
  let students = await User.findStudents();
  const user = req.user;
  if (user.userType === 'S') {
    students = students.map((student) => {
      student.photo = [];
      return student;
    });
  }
  res.json({ students });
};

export const getAllTeachers = async (req: Request, res: Response) => {
  const teachers = await User.model.findTeachers();
  res.json({ teachers });
};

export const decodeJWT = async (req: Request, res: Response) => {
  const identity = req.user;
  res.json({ identity });
};

export const reloadUsers = async (req: Request, res: Response) => {
  try {
    await reloadAllUsers();
    await attachStudentInfo();
    res.end();
  } catch (error) {
    throw new HttpException(500, error.message);
  }
};
