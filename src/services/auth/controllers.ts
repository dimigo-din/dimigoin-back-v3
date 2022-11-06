import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { Account } from '../../interfaces/dimi-api';
import { CircleModel, PermissionModel } from '../../models';
import { issue as issueToken, verify, getTokenType } from '../../resources/token';
import { getIdentity, getStudentInfo } from '../../resources/dimi-api';

const getExtraPermissions = async (userIdx: number) => {
  try {
    const user = await getStudentInfo(userIdx);
    const permissions = [];

    // (부)동아리장은 동아리원 선발 서비스 권한 부여
    const circle = await CircleModel.findByChairs(user.user_id);
    if (circle) {
      permissions.push('circle-applier-selection');
    }

    return permissions;
  } catch (e) {
    return [];
  }
};

export const identifyUser = async (req: Request, res: Response) => {
  const account: Account = req.body;
  const { dalgeurak } = req.query;

  try {
    const identity = await getIdentity(account, dalgeurak as string);

    const { permissions } = await PermissionModel.findOne({ userId: identity.id });
    identity.permissions = permissions;
    identity.permissions.push(
      ...await getExtraPermissions(identity.id),
    );

    res.json({
      accessToken: await issueToken(identity, false),
      refreshToken: await issueToken(identity, true),
      dalgeurakFirstLogin: identity.dalgeurakFirstLogin,
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
  res.json({
    accessToken: await issueToken(payload, false),
    refreshToken: await issueToken(payload, true),
  });
};
