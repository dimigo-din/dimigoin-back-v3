import { OutgoSearch, OutgoSearchResult } from '../interfaces';
import { getTeacherInfo, studentSearch } from './dimi-api';

export const getOutgoResults = async (outgoRequest: OutgoSearch) => {
  const students = await studentSearch({ user_id: outgoRequest.applier });
  const teacher = await getTeacherInfo(outgoRequest.approver);
  const result: OutgoSearchResult = {
    applier: students.map((v) => v.name),
    approver: teacher.name,
    reason: outgoRequest.reason,
    detailReason: outgoRequest.detailReason,
    duration: outgoRequest.duration,
    status: outgoRequest.status,
  };

  return result;
};
