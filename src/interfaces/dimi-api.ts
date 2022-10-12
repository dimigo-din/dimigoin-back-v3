/* eslint-disable camelcase */

import { Gender, UserType } from '../types';

export interface Account {
  username: string;
  password: string;
}

export interface UserIdentity {
  'user_id': number;
  'username': string;
  'email': string;
  'name': string;
  'nick': string;
  'gender': Gender;
  'user_type': UserType;
}

export interface StudentIdentity {
  'user_id': number;
  'username': string;
  'email': string;
  'name': string;
  'grade': number;
  'class': number;
  'number': number;
  'serial': number;
  'nick': string;
  'gender': Gender;
  'user_type': UserType;
  'birthdate': string;
  'phone': string;
  'library_id': string;
}

export interface TeacherIdentity {
  user_id: number;
  username: string;
  name: string;
  gender: Gender;
  position_name: string;
  role_name: string;
  grade: number;
  class: number;
}
