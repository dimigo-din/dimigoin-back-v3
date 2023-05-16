import { OutgoRequestStatus } from '../types';

export interface OutgoSearch {
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
