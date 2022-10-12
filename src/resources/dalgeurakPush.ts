import admin from 'firebase-admin';
import { PermissionModel, TokenModel } from '../models';
import { dalgeurakFbConfig } from '../firebase-config';
import { studentSearch, teacherSearch } from './dimi-api';

const dalgeurakFb = admin.initializeApp(
  {
    credential: admin.credential.cert(dalgeurakFbConfig),
  },
  'dalgeurak',
);

export const DGRsendPushMessage = async (
  userFilter: object,
  title: string,
  body: string,
  isTeacher?: boolean,
  isPermission?: boolean,
) => {
  let users;
  if (isTeacher) {
    users = (await teacherSearch(userFilter)).map((e) => e.user_id);
  } else if (isPermission) {
    users = (await PermissionModel.find(userFilter)).map((e) => e.userId);
  } else {
    users = (await studentSearch(userFilter)).map((e) => e.user_id);
  }
  const FCMTokens = await TokenModel.find({
    userId: {
      $in: users,
    },
  });
  const message = { title, body };
  const userTokens = FCMTokens.reduce(
    (t, u) => [...t, ...u.dalgeurakToken],
    [],
  );

  // Firebase에서 한 번 호출 시에 최대 500개의 토큰까지만 지원함
  const devidedUserTokens = Array.from(
    { length: Math.ceil(userTokens.length / 500) },
    () => userTokens.splice(0, 500),
  );

  const results = [];
  for (const tokens of devidedUserTokens) {
    const result = await dalgeurakFb.messaging().sendMulticast({
      notification: message,
      tokens,
    });
    results.push(result);
  }
  return results;
};
