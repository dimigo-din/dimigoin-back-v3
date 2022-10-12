/* eslint-disable camelcase */
import { Gender, UserType } from '../types';

export interface User {
  user_id: number;
  library_id: string;
  class: number;
  dormitory: string;
  gender: Gender;
  grade: number;
  name: string;
  number: string;
  serial: string;
  username: string;
  userType: UserType;
  permissions: Array<string>;
}
