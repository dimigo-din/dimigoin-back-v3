import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '인원 현황 서비스',
  baseURL: '/attendance',
  routes: [
    {
      method: 'get',
      path: '/date/:date/grade/:grade/class/:class',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getClassStatus,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['S'],
      validateSchema: {
        place: Joi.string().required(),
        remark: Joi.string().required(),
      },
      handler: controllers.createAttendanceLog,
    },
    {
      method: 'get',
      path: '/my-status',
      allowedUserTypes: ['S'],
      handler: controllers.myAttendanceStatus,
    },
  ],
};
