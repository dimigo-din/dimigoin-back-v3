import { Request, Response } from 'express';
import { WasherModel } from '../../models';
// import { HttpException } from '../../exceptions';

export const getAllWashers = async (req: Request, res: Response) => {
  const washers = WasherModel.find({});

  res.json({ washers });
};

export const getAvailableWashers = async (req: Request, res: Response) => {
  const gender = req.body;
  const washers = WasherModel.find({ gender });

  res.json({ washers });
};
