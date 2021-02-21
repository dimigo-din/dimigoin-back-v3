import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

const yyyymmdd = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;

export default createService({
  name: '멘토링 수강 신청 서비스',
  baseURL: '/mentoring-application',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMyAllApplications,
    },
    {
      method: 'post',
      path: '/:mentoringId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        date: Joi.string().regex(yyyymmdd).required(),
      },
      handler: controllers.applyMentoring,
    },
    {
      method: 'delete',
      path: '/:mentoringId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        date: Joi.string().regex(yyyymmdd).required(),
      },
      handler: controllers.cancelApplication,
    },
  ],
});
