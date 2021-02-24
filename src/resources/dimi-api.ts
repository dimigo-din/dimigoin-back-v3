import axios from 'axios';
import {
  Account,
  StudentIdentity,
  UserIdentity,
  TeacherIdentity,
} from '../interfaces/dimi-api';
import { UserModel } from '../models';
import { services as allServices } from '../services';
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

export const getIdentity = async (account: Account) => {
  const { data } = await api.get(apiRouter.getIdentity, {
    params: account,
  });
  return data;
};

export const restructureUserIdentity = (identity: UserIdentity) => ({
  idx: identity.id,
  username: identity.username,
  name: identity.name,
  userType: identity.user_type,
  gender: identity.gender,
  phone: identity.phone,
  birthdate: identity.birthdate,
  photos: [identity.photofile1, identity.photofile2]
    .filter((v) => v)
    .map((v) => `https://api.dimigo.hs.kr/user_photo/${v}`),
});

export const reloadAllUsers = async () => {
  const { data: users } = await api.get(apiRouter.getAllUsers);
  Object.keys(users).forEach(async (idx) => {
    users[idx] = restructureUserIdentity(users[idx]);
    const user = await UserModel.findOne({ idx: users[idx].idx });
    if (users[idx].userType === 'T') {
      users[idx].permissions = allServices;
    }
    if (!user) {
      await UserModel.create(users[idx]);
    } else {
      await UserModel.updateOne({ idx: users[idx].idx }, users[idx]);
    }
  });
};

export const attachStudentInfo = async () => {
  const { data } = await api.get(apiRouter.getAllStudents);
  const students: StudentIdentity[] = data;
  await Promise.all(
    students.map(async (student) => {
      await UserModel.updateOne(
        { idx: student.user_id },
        {
          grade: student.grade,
          class: student.class,
          number: student.number,
          serial: student.serial,
          libraryId: student.library_id,
        },
      );
      return student;
    }),
  );
};

export const attachTeacherInfo = async () => {
  const { data } = await api.get(apiRouter.getAllTeachers);
  const teachers: TeacherIdentity[] = data;
  await Promise.all(
    teachers.map(async (teacher) => {
      await UserModel.updateOne(
        { idx: teacher.user_id },
        {
          position: teacher.position_name,
          role: teacher.role_name === '담임' && teacher.grade && teacher.class
            ? `${teacher.grade}학년 ${teacher.class}반 ${teacher.role_name}`
            : teacher.role_name,
        },
      );
    }),
  );
};
