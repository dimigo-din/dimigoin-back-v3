import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { Account } from '../../interfaces/dimi-api';
import { CircleModel, PermissionModel } from '../../models';
import { issue as issueToken, verify, getTokenType } from '../../resources/token';
import { getIdentity, getStudentInfo } from '../../resources/dimi-api';

const getExtraPermissions = async (userIdx: number) => {
  const user = await getStudentInfo(userIdx);
  const permissions = [];

  // (부)동아리장은 동아리원 선발 서비스 권한 부여
  const circle = await CircleModel.findByChairs(user.user_id);
  if (circle) {
    permissions.push('circle-applier-selection');
  }

  return permissions;
};

const getEntireIdentity = async (userIdx: number) => {
  const { permissions } = await PermissionModel.findOne({ userId: userIdx });
  const identity = await getStudentInfo(userIdx);
  if (!identity) throw new HttpException(404, '해당 사용자를 찾을 수 없습니다.');
  identity.permissions = permissions;
  identity.permissions.push(
    ...await getExtraPermissions(userIdx),
  );
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
    if (error.name === 'HttpException') throw error;
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
