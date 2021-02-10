import admin from 'firebase-admin';
import config from '../config';
import { UserModel } from '../models';

admin.initializeApp({
  credential: admin.credential.cert(
    'firebase-service-account.json',
  ),
  databaseURL: config.firebaseDatabaseURL,
});

export const sendPushMessage = async (userFilter: object, title: string, body: string) => {
  const users = await UserModel.find(userFilter).select('tokens');
  const message = { title, body };
  const userTokens = users.reduce((t, u) => [...t, ...(u.tokens)], []);

  // Firebase에서 한 번 호출 시에 최대 500개의 토큰까지만 지원함
  const devidedUserTokens = Array.from(
    { length: Math.ceil(userTokens.length / 500) },
    () => userTokens.splice(0, 500),
  );

  const results = [];
  for (const tokens of devidedUserTokens) {
    const result = await admin.messaging().sendMulticast({
      notification: message,
      tokens,
    });
    results.push(result);
  }
  return results;
};
