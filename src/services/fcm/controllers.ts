import { Request, Response } from 'express';
import { UserModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getAllDeviceTokens = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user._id).select('tokens');
  res.json({ registeredTokens: user.tokens });
};

export const registerDeviceToken = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user._id).select('tokens');
  const tokenIndex = user.tokens.indexOf(req.body.deviceToken);
  if (tokenIndex > -1) throw new HttpException(409, '해당 디바이스 토큰이 이미 서버에 등록되어 있습니다.');
  user.tokens.push(req.body.deviceToken);
  await user.save();
  res.json({ registeredTokens: user.tokens });
};

export const revokeDeviceToken = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user._id).select('tokens');
  const tokenIndex = user.tokens.indexOf(req.body.deviceToken);
  if (tokenIndex < 0) throw new HttpException(404, '해당 디바이스 토큰이 사용자 모델에 등록되어 있지 않습니다.');
  user.tokens.splice(tokenIndex, 1);
  await user.save();
  res.json({ registeredTokens: user.tokens });
};
