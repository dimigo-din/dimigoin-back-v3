import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { DetsModel } from '../models';
// import {IDetsInput,IDets} from '../interfaces/dets'

export const getDetsList = async (req: Request, res: Response) => {
  const Dets = await DetsModel.find({});
  res.json({ Dets });
};

export const getDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsId);
  res.json({ dets });
};

export const createDets = async (req: Request, res: Response) => {
  const dets = new DetsModel();
  Object.assign(dets, req.body);

  await dets.save();

  res.json({ dets });
};

export const editDets = async (req: Request, res: Response) => {
  const dets = await DetsModel.findById(req.params.detsId);
  if (!dets) throw new HttpException(404, '해당 뎃츠를 찾을 찾을 수 없습니다.');
  Object.assign(dets, req.body);
  await dets.save();
  res.json({ dets });
};

export const applyDets = async (req: Request, res: Response) => {
  const userID = res.locals.user.idx as string;
  const detsID = req.params.detsId as string;
  // @ts-ignore
  const isMax:boolean = DetsModel.find({ _id: detsID }, (err:any, model:any) => {
    if (model === undefined || model == null) {
      throw new HttpException(404, '해당 뎃츠를 찾을 찾을 수 없습니다.');
    }
    if (model.user.length < model.maxCount) {
      return false;
    }
    return true;
  });
  if (isMax === false) {
    DetsModel.findByIdAndUpdate(
      detsID,
      { $push: { user: userID } },
      { upsert: true, new: true },
      (err:any, model:any) => {
        if (err) throw new HttpException(500, err);
      },
    );
  }
};
