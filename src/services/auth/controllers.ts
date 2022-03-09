import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { HttpException } from '../../exceptions';
import { Account } from '../../interfaces/dimi-api';
import { UserModel, CircleModel, TemporaryPasswordModel } from '../../models';
// import { getIdentity } from '../../resources/dimi-api';
import { issue as issueToken, verify, getTokenType } from '../../resources/token';
import { User } from '../../interfaces';

const getExtraPermissions = async (userIdx: number) => {
  const user = await UserModel.findOne({ idx: userIdx });
  const permissions = [];

  // (부)동아리장은 동아리원 선발 서비스 권한 부여
  const circle = await CircleModel.findByChairs(user._id);
  if (circle) {
    permissions.push('circle-applier-selection');
  }

  return permissions;
};

const getEntireIdentity = async (userIdx: number) => {
  const extraIdentity = await UserModel.findOne({ idx: userIdx })
    .select('photos')
    .select('permissions')
    .select('birthdate')
    .select('libraryId');
  const identity = await UserModel.findByIdx(userIdx) as User;
  if (!identity) throw new HttpException(404, '해당 사용자를 찾을 수 없습니다.');
  identity.photos = extraIdentity.photos;
  identity.permissions = extraIdentity.permissions;
  identity.permissions.push(
    ...await getExtraPermissions(userIdx),
  );
  identity.birthdate = extraIdentity.birthdate;
  identity.libraryId = extraIdentity.libraryId;
  return identity;
};

export const identifyUser = async (req: Request, res: Response) => {
  const account: Account = req.body;

  try {
    const user = await UserModel.findOne({ username: account.username });
    if (!user) throw new HttpException(404, '학생 정보를 찾을 수 없습니다.');
    const info = await TemporaryPasswordModel.findOne({ user: user._id });
    if (!info) throw new HttpException(404, '학생 또는 선생님 계정이 아닙니다.');
    if (!info.status) throw new HttpException(401, '임시 비밀번호를 설정해주세요.');

    const hashPassword = crypto.createHash('sha512').update(account.password + info.salt).digest('hex');
    if (hashPassword === info.password) {
      const identity = await getEntireIdentity(user.idx);
      res.json({
        accessToken: await issueToken(identity, false),
        refreshToken: await issueToken(identity, true),
      });
    } else throw new HttpException(401, '아이디 또는 비밀번호가 일치하지 않습니다.');
    // const { id: idx } = await getIdentity(account);
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

export const setTemporaryPassword = async (req: Request, res: Response) => {
  const { id, code, password } = req.body;
  const user = await UserModel.findOne({ username: id });
  if (!user) throw new HttpException(404, '유저 정보를 찾을 수 없습니다.');

  const codeInfo = await TemporaryPasswordModel.findOne({ user: user._id });
  if (!codeInfo) throw new HttpException(404, '학생 또는 선생님 계정이 아닙니다.');
  if (codeInfo.status) throw new HttpException(401, '이미 비밀번호를 변경하셨습니다.');
  if (codeInfo.code === code) {
    const passwordSalt = Math.random().toString(16).slice(2) + Math.random().toString(36).slice(2);
    const hashPassword = crypto.createHash('sha512').update(password + passwordSalt).digest('hex');

    Object.assign(codeInfo, {
      status: true,
      salt: passwordSalt,
      password: hashPassword,
      code: '',
    });
    await codeInfo.save();
  } else throw new HttpException(401, '인증코드가 일치하지 않습니다.');
  res.json({ message: '임시 비밀번호 설정에 완료하였습니다.' });
};

export const grantCode = async (req: Request, res: Response) => {
  const users = await UserModel.find({ userType: { $in: ['T', 'D'] } });
  const students = await UserModel.find({ userType: { $in: ['S'] }, serial: { $exists: true } });

  users.forEach(async (user) => {
    await new TemporaryPasswordModel({
      user: new ObjectId(user._id),
      status: false,
      code: Math.random().toString().substring(2, 8),
    }).save();
  });
  students.forEach(async (user) => {
    await new TemporaryPasswordModel({
      user: new ObjectId(user._id),
      status: false,
      code: Math.random().toString().substring(2, 8),
    }).save();
  });

  return res.json({ success: true });
};

export const getCodes = async (req:Request, res: Response) => {
  await TemporaryPasswordModel.deleteMany({});
  interface studentIF {
    serial: number;
    grade: number;
    class: number;
    number: number;
    name: string;
    code: string;
  }
  interface teacherIF {
    position: string;
    role: string;
    code: string;
    name: string;
  }
  const codes = await TemporaryPasswordModel.find({});
  const TInfo: Array<teacherIF> = [];
  const SInfo: Array<studentIF> = [];
  const DInfo: Array<teacherIF> = [];
  await Promise.all(
    codes.map(async (info) => {
      const user = await UserModel.findById(info.user);
      if (user.userType === 'S') {
        SInfo.push({
          serial: user.serial,
          grade: user.grade,
          class: user.class,
          number: user.number,
          name: user.name,
          code: info.code,
        });
      } else if (user.userType === 'T') {
        TInfo.push({
          position: user.position,
          role: user.role,
          name: user.name,
          code: info.code,
        });
      } else if (user.userType === 'D') {
        DInfo.push({
          position: user.position,
          role: user.role,
          name: user.name,
          code: info.code,
        });
      }
    }),
  );
  res.json({
    TInfo,
    SInfo,
    DInfo,
  });
};
