import { Request, Response } from 'express';
import { getAllStudents, getAllTeachers } from '../../resources/dimi-api';

export const getAllUsers = async (req: Request, res: Response) => {
  const students = await getAllStudents();
  const teachers = await getAllTeachers();
  res.json({ users: [...students, ...teachers] });
};

export const getAllStds = async (req: Request, res: Response) => {
  const students = await getAllStudents();
  res.json({ students });
};

export const getAllTchs = async (req: Request, res: Response) => {
  const teachers = await getAllTeachers();
  res.json({ teachers });
};

export const decodeJWT = async (req: Request, res: Response) => {
  const identity = req.user;
  res.json({ identity });
};
