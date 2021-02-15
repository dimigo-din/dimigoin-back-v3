import Joi from 'joi';
import { GradeValues } from '../../types';
import * as controllers from './controllers';

const yyyymmdd = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;

export default {
  name: '공지사항 서비스',
  baseURL: '/notice',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: '*',
      handler: controllers.getAllNotices,
    },
    {
      method: 'get',
      path: '/current',
      allowedUserTypes: '*',
      handler: controllers.getCurrentNotices,
    },
    {
      method: 'get',
      path: '/:noticeId',
      allowedUserTypes: '*',
      handler: controllers.getNotice,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['T'],
      validateSchema: {
        title: Joi.string().required(),
        content: Joi.string().required(),
        targetGrade: Joi.array().items(Joi.number().valid(...GradeValues)).required(),
        startDate: Joi.string().regex(yyyymmdd).required(),
        endDate: Joi.string().regex(yyyymmdd).required(),
      },
      handler: controllers.createNotice,
    },
    {
      method: 'patch',
      path: '/:noticeId',
      allowedUserTypes: ['T'],
      validateSchema: {
        title: Joi.string(),
        content: Joi.string(),
        targetGrade: Joi.array().items(Joi.number().valid(...GradeValues)),
        startDate: Joi.string().regex(yyyymmdd),
        endDate: Joi.string().regex(yyyymmdd),
      },
      handler: controllers.editNotice,
    },
    {
      method: 'delete',
      path: '/:noticeId',
      allowedUserTypes: ['T'],
      handler: controllers.removeNotice,
    },
  ],
};
