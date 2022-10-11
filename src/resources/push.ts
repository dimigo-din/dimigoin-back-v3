import admin from 'firebase-admin';
import { TokenModel } from '../models';
import { dimigoinFbConfig } from '../firebase-config';
import { studentSearch } from './dimi-api';

const dimigoinFb = admin.initializeApp({
  credential: admin.credential.cert(dimigoinFbConfig),
  databaseURL: dimigoinFbConfig.databaseURL,
}, 'dimigoin');

export const sendPushMessage = async (userFilter: object, title: string, body: string) => {
  const users = (await studentSearch(userFilter)).map((e) => e.user_id);
  const FCMTokens = await TokenModel.find({
    userId: {
      $in: users,
    },
  });
  const message = { title, body };
  const userTokens = FCMTokens.reduce((t, u) => [...t, ...(u.dalgeurakToken)], []);

  // Firebase에서 한 번 호출 시에 최대 500개의 토큰까지만 지원함
  const devidedUserTokens = Array.from(
    { length: Math.ceil(userTokens.length / 500) },
    () => userTokens.splice(0, 500),
  );

  const results = [];
  for (const tokens of devidedUserTokens) {
    const result = await dimigoinFb.messaging().sendMulticast({
      notification: message,
      tokens,
    });
    results.push(result);
  }
  return results;
};
