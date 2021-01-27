import Joi from 'joi';
import * as controllers from './controllers';

export default {
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
        targetGrade: Joi.array().items(Joi.number()).required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
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
        targetGrade: Joi.array().items(Joi.number()),
        startDate: Joi.date(),
        endDate: Joi.date(),
      },
      handler: controllers.editNotice,
    },
  ],
};
