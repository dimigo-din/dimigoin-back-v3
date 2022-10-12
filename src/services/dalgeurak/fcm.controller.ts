import { Request, Response } from 'express';
import { TokenModel } from '../../models';
import { HttpException } from '../../exceptions';

export const getDeviceTokens = async (req: Request, res: Response) => {
  const user = await TokenModel.findOne({ userId: req.user.user_id }).select('dalgeurakToken');
  res.json({ registeredTokens: user.dalgeurakToken });
};
export const registerDeviceToken = async (req: Request, res: Response) => {
  const { deviceToken } = req.body;
  const user = await TokenModel.findOne({ userId: req.user.user_id }).select('dalgeurakToken');
  const tokenIndex = user.dalgeurakToken.indexOf(deviceToken);
  if (tokenIndex > -1) throw new HttpException(409, '해당 디바이스 토큰이 이미 서버에 등록되어 있습니다.');
  user.dalgeurakToken.push(deviceToken);
  await user.save();
  res.json({ registeredTokens: user.dalgeurakToken });
};
export const revokeDeviceToken = async (req: Request, res: Response) => {
  const { deviceToken } = req.body;
  const user = await TokenModel.findOne({ userId: req.user.user_id }).select('dalgeurakToken');
  const tokenIndex = user.dalgeurakToken.indexOf(deviceToken);
  if (tokenIndex < 0) throw new HttpException(404, '해당 디바이스 토큰이 사용자 모델에 등록되어 있지 않습니다.');
  user.dalgeurakToken.splice(tokenIndex, 1);
  await user.save();
  res.json({ registeredTokens: user.dalgeurakToken });
};
