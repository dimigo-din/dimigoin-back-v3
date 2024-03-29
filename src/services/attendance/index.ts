import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '인원 현황 서비스',
  baseURL: '/attendance',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getMyAttendanceLogs,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        place: Joi.string().required(),
        remark: Joi.string().optional(),
      },
      handler: controllers.createAttendanceLog,
    },
    {
      method: 'post',
      path: '/student/:studentId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        place: Joi.string().required(),
        remark: Joi.string().optional(),
      },
      handler: controllers.createAttendanceLogByManager,
    },
    {
      method: 'get',
      path: '/date/:date/grade/:grade/class/:class/status',
      needAuth: true,
      needPermission: false,
      handler: controllers.getClassStatus,
    },
    {
      method: 'get',
      path: '/date/:date/grade/:grade/class/:class/timeline',
      needAuth: true,
      needPermission: true,
      handler: controllers.getClassTimeline,
    },
    {
      method: 'get',
      path: '/date/:date/student/:studentId',
      needAuth: true,
      needPermission: true,
      handler: controllers.getStudentAttendanceHistory,
    },
  ],
});
