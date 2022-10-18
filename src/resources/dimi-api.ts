import axios from 'axios';
import { Account, TeacherIdentity } from '../interfaces/dimi-api';
import config from '../config';
import { User } from '../interfaces';
import { PermissionModel, UserTypeModel } from '../models';
import { services as allServices } from '../services';
import { MealStatusModel } from '../models/dalgeurak';

const apiRouter = {
  getIdentity: '/v1/users/identify',
  getAllUsers: '/v1/users',
  getAllTeachers: '/v1/user-teachers',
  getStudent: '/v1/user-students/search',
  getTeacher: '/v1/user-students/search',
};

const api = axios.create({
  auth: {
    username: config.apiId,
    password: config.apiPw,
  },
  baseURL: config.apiUrl,
});

export const getIdentity = async (account: Account, dalgeurak?: string) => {
  const { data } = await api.get(apiRouter.getIdentity, {
    params: account,
  });

  const dalgeurakWhether = dalgeurak ? JSON.parse(dalgeurak) : false;

  const userType = await UserTypeModel.findOne({ userId: data.id });
  if (!userType) {
    await new UserTypeModel({
      userId: data.id,
      type: data.user_type,
    }).save();

    if ('TD'.includes(data.user_type)) {
      const initPermissions = allServices.filter(
        (e) =>
          e !== 'circle-applier-selection'
          && e !== 'dalgeurak'
          && e !== 'dalgeurak-management',
      );
      await new PermissionModel({
        userId: data.id,
        permissions: initPermissions,
      }).save();
    } else {
      await new PermissionModel({
        userId: data.id,
        permissions: [],
      }).save();
    }
    if (dalgeurakWhether) {
      await new MealStatusModel({
        userId: data.id,
        mealStatus: 'empty',
      }).save();
      data.dalgeurakFirstLogin = true;
    }
  } else {
    const mealStatusWhether = await MealStatusModel.findOne({ userId: data.id });
    if (!mealStatusWhether && dalgeurakWhether) {
      await new MealStatusModel({
        userId: data.id,
        mealStatus: 'empty',
      }).save();
      data.dalgeurakFirstLogin = true;
    } else {
      data.dalgeurakFirstLogin = false;
    }
  }

  return data;
};

export const getStudentInfo = async (userId: number): Promise<User> => {
  const { data } = await api.get(apiRouter.getStudent, {
    params: {
      user_id: userId,
    },
  });
  return data[0];
};
export const getTeacherInfo = async (userId: number): Promise<User> => {
  const { data } = await api.get(apiRouter.getTeacher, {
    params: {
      user_id: userId,
    },
  });
  return data[0];
};

export const getAllStudents = async (): Promise<User[]> => {
  const { data } = await api.get(apiRouter.getStudent, {
    params: {
      grade: [1, 2, 3],
    },
  });
  return data;
};
export const getAllTeachers = async (): Promise<User[]> => {
  const { data } = await api.get(apiRouter.getAllTeachers);
  return data;
};

export const studentSearch = async (param: object): Promise<User[]> => {
  const { data } = await api.get(apiRouter.getStudent, {
    params: param,
  });
  return data;
};
export const teacherSearch = async (
  param: object,
): Promise<TeacherIdentity[]> => {
  const { data } = await api.get(apiRouter.getTeacher, {
    params: param,
  });
  return data;
};

export const teacherRoleParse = (role: string) => {
  try {
    const sRole = role.split(' ');
    if (sRole[sRole.length - 1] === '담임') {
      return {
        grade: parseInt(sRole[0][0]),
        class: parseInt(sRole[1][0]),
      };
    }
    return false;
  } catch (e) {
    return false;
  }
};
