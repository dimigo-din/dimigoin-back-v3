import admin from 'firebase-admin';
import { dalgeurakFbConfig } from '../firebase-config';
import { UserModel } from '../models';

const dalgeurakFb = admin.initializeApp({
  credential: admin.credential.cert(dalgeurakFbConfig),
}, 'dalgeurak');

export const DGRsendPushMessage = async (userFilter: object, title: string, body: string) => {
  const users = await UserModel.find(userFilter).select('dalgeurakToken');
  const message = { title, body };
  const userTokens = users.reduce((t, u) => [...t, ...(u.dalgeurakToken)], []);

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
