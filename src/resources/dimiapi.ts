import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import { IAccount, IStudentIdentity, IUserIdentity } from '../interfaces/DimiAPI';
import { UserModel } from '../models';

dotenv.config();

enum DimiAPIRouter {
  getIdentity = '/v1/users/identify',
  getAllUsers = '/v1/users',
  getAllStudents = '/v1/user-students',
}

export default class DimiAPI {
  private baseURL = process.env.DIMIAPI_URL;

  private authOption = {
    username: process.env.DIMIAPI_ID,
    password: process.env.DIMIAPI_PW,
  };

  private APIClient: AxiosInstance;

  constructor() {
    this.createAPIClient();
  }

  public async getIdentity(account: IAccount) {
    const { data } = await this.APIClient.get(DimiAPIRouter.getIdentity, {
      params: account,
    });
    return data;
  }

  public restructureUserIdentity(identity: IUserIdentity) {
    return {
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
    };
  }

  public async reloadAllUsers() {
    const { data: users } = await this.APIClient.get(DimiAPIRouter.getAllUsers);
    Object.keys(users).forEach(async (idx) => {
      users[idx] = this.restructureUserIdentity(users[idx]);
      const user = await UserModel.findOne({ idx: users[idx].idx });
      if (!user) {
        // eslint-disable-next-line
        await UserModel.create(users[idx]).catch((e) => console.error(e));
      } else {
        await UserModel.updateOne({ idx: users[idx].idx }, users[idx]);
      }
    });
  }

  public async attachStudentInfo() {
    const { data } = await this.APIClient.get(DimiAPIRouter.getAllStudents);
    const students: IStudentIdentity[] = data;
    await Promise.all(
      students.map(async (student) => {
        await UserModel.updateOne({ idx: student.user_id }, {
          grade: student.grade,
          class: student.class,
          number: student.number,
          serial: Number(student.serial),
        });
        return student;
      }),
    );
  }

  private createAPIClient() {
    this.APIClient = axios.create({
      auth: this.authOption,
      baseURL: this.baseURL,
    });
  }
}
