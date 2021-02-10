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
  const userTokens = users.reduce((t, u) => [...t, ...(u.tokens)], []);
  const message = { title, body };
  return await admin.messaging().sendMulticast({
    notification: message,
    tokens: userTokens,
  });
};
