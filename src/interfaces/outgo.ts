import { ObjectId } from 'mongodb';
import { OutgoRequestStatus } from '../types';

export interface OutgoSearch {
  _id: ObjectId;
  applier: number[];
  approver: number;
  reason: string;
  detailReason: string;
  duration: {
    start: Date;
    end: Date;
  };
  status: OutgoRequestStatus;
}

export interface OutgoSearchResult {
  _id: ObjectId;
  applier: string[];
  approver: string;
  reason: string;
  detailReason: string;
  duration: {
    start: Date;
    end: Date;
  };
  status: OutgoRequestStatus;
}
