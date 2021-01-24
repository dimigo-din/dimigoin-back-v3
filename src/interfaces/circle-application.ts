import { ObjectId } from 'mongodb';

export interface ICircleApplicationQuestion {
  question: string;
  maxLength: number;
}

export interface ICircleApplicationForm {
  [key: string]: string;
}

export interface ICircleApplication {
  circle: ObjectId;
  applier: ObjectId;
  form: ICircleApplicationForm;
  status?: string;
}
