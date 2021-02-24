import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { Account } from '../../interfaces/dimi-api';
import { UserModel } from '../../models';
import { getIdentity } from '../../resources/dimi-api';
import { issue as issueToken, verify, getTokenType } from '../../resources/token';
import { User } from '../../interfaces';

const getEntireIdentity = async (userIdx: number) => {
  const extraIdentity = await UserModel.findOne({ idx: userIdx })
    .select('photos')
    .select('permissions')
    .select('birthdate')
    .select('libraryId');
  const identity = await UserModel.findByIdx(userIdx) as User;
  identity.photos = extraIdentity.photos;
  identity.permissions = extraIdentity.permissions;
  identity.birthdate = extraIdentity.birthdate;
  identity.libraryId = extraIdentity.libraryId;
  return identity;
};

export const identifyUser = async (req: Request, res: Response) => {
  const account: Account = req.body;

  try {
    const { id: idx } = await getIdentity(account);
    const identity = await getEntireIdentity(idx);

    res.json({
      accessToken: await issueToken(identity, false),
      refreshToken: await issueToken(identity, true),
    });
  } catch (error) {
    throw new HttpException(401, '인증에 실패했습니다.');
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { token: refreshToken } = req;
  if (!refreshToken) throw new HttpException(400, '리프레시 토큰이 전달되지 않았습니다.');

  const tokenType = await getTokenType(refreshToken);
  if (tokenType !== 'REFRESH') throw new HttpException(400, '리프레시 토큰이 아닙니다.');

  const payload = await verify(refreshToken);
  const identity = await getEntireIdentity(payload.idx);
  res.json({
    accessToken: await issueToken(identity, false),
    refreshToken: await issueToken(identity, true),
  });
};
