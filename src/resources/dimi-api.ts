import axios from 'axios';
import {
  IAccount,
  IStudentIdentity,
  IUserIdentity,
  ITeacherIdentity,
} from '../interfaces/dimi-api';
import { UserModel } from '../models';
import config from '../config';

const apiRouter = {
  getIdentity: '/v1/users/identify',
  getAllUsers: '/v1/users',
  getAllStudents: '/v1/user-students',
  getAllTeachers: '/v1/user-teachers',
};

const api = axios.create({
  auth: {
    username: config.apiId,
    password: config.apiPw,
  },
  baseURL: config.apiUrl,
});

export const getIdentity = async (account: IAccount) => {
  const { data } = await api.get(apiRouter.getIdentity, {
    params: account,
  });
  return data;
};

export const restructureUserIdentity = (identity: IUserIdentity) => ({
  idx: identity.id,
  username: identity.username,
  name: identity.name,
  userType: identity.user_type,
  gender: identity.gender,
  phone: identity.phone,
  photo: [
    identity.photofile1,
    identity.photofile2,
  ].filter((v) => v),
});

export const reloadAllUsers = async () => {
  const { data: users } = await api.get(apiRouter.getAllUsers);
  Object.keys(users).forEach(async (idx) => {
    users[idx] = restructureUserIdentity(users[idx]);
    const user = await UserModel.findOne({ idx: users[idx].idx });
    if (!user) {
      // eslint-disable-next-line
      await UserModel.create(users[idx]).catch((e) => console.error(e));
    } else {
      await UserModel.updateOne({ idx: users[idx].idx }, users[idx]);
    }
  });
};

export const attachStudentInfo = async () => {
  const { data } = await api.get(apiRouter.getAllStudents);
  const students: IStudentIdentity[] = data;
  await Promise.all(
    students.map(async (student) => {
      await UserModel.updateOne(
        { idx: student.user_id },
        {
          grade: student.grade,
          class: student.class,
          number: student.number,
          serial: student.serial,
        },
      );
      return student;
    }),
  );
};

export const attachTeacherInfo = async () => {
  const { data } = await api.get(apiRouter.getAllTeachers);
  const teachers: ITeacherIdentity[] = data;
  await Promise.all(
    teachers.map(async (teacher) => {
      await UserModel.updateOne(
        { idx: teacher.user_id },
        {
          position: teacher.position_name,
          role: teacher.grade && teacher.class
            ? `${teacher.grade}학년 ${teacher.class}반 ${teacher.role_name}`
            : teacher.role_name,
        },
      );
    }),
  );
};
