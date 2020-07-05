import axios from 'axios';
import config from '../config';
import { Account } from '../interfaces/dimiapi';

/* eslint-disable */
enum router {
  getIdentity = '/v1/users/identify',
  getAllUsers = '/v1/users',
  getAllStudents = '/v1/user-students',
};
/* eslint-enable */

const api = axios.create({
  auth: {
    username: config.apiId!,
    password: config.apiPw!,
  },
  baseURL: config.apiUrl,
});

async function getIdentity(account: Account) {
  const { data } = await api.get(
    router.getIdentity,
    { params: account },
  );
  return data;
}

export default {
  getIdentity,
};
