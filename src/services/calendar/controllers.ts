import { Request, Response } from 'express';

export const getCalendar = async (req: Request, res: Response) => {
  res.json({ success: true });
};
