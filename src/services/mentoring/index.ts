import Joi from 'joi';
import * as controllers from './controllers';
import { DayValues, GradeValues } from '../../types';
import { createService } from '../index';

const timeSchema = Joi.object({
  hour: Joi.number().min(0).max(23).required(),
  minute: Joi.number().min(0).max(59).required(),
});

export default createService({
  name: '멘토링 수업 서비스',
  baseURL: '/mentoring',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllMentorings,
    },
    {
      method: 'get',
      path: '/:mentoringId',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMentoring,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        teacher: Joi.string().required(),
        subject: Joi.string().required(),
        days: Joi.array().items(
          Joi.string().valid(...DayValues),
        ).min(1).max(7)
          .required(),
        targetGrades: Joi.array().items(
          Joi.number().valid(...GradeValues),
        ).min(1).max(3)
          .required(),
        duration: Joi.object({
          start: timeSchema.required(),
          end: timeSchema.required(),
        }).required(),
      },
      handler: controllers.createMentoring,
    },
    {
      method: 'delete',
      path: '/:mentoringId',
      needAuth: true,
      needPermission: true,
      handler: controllers.deleteMentoring,
    },
    {
      method: 'patch',
      path: '/:mentoringId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().optional(),
        teacher: Joi.string().optional(),
        subject: Joi.string().optional(),
        days: Joi.array().items(
          Joi.string().valid(...DayValues),
        ).min(1).max(7)
          .optional(),
        targetGrades: Joi.array().items(
          Joi.number().valid(...GradeValues),
        ).min(1).max(3)
          .optional(),
        duration: Joi.object({
          start: timeSchema.required(),
          end: timeSchema.required(),
        }).optional(),
      },
      handler: controllers.editMentoring,
    },
  ],
});
