import dotenv from 'dotenv';

const env = dotenv.config();
if (!env) throw new Error('No env file found');

export default {
  type: process.env.FIREBASE_TYPE!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  clientId: process.env.FIREBASE_CLIENT_ID!,
  authUri: process.env.FIREBASE_AUTH_URI!,
  tokenUri: process.env.FIREBASE_TOKEN_URI!,
  databaseURL: process.env.FIREBASE_DATABASE_URL!,
  apiKey: process.env.FIREBASE_API_KEY!,
  authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL!,
  clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
};
