import Joi from 'joi';
import * as controllers from './controllers';
import {
  DayValues,
  GradeValues,
  TimeValues,
} from '../../types';
import { createService } from '../index';

// 복수형 표현 위해서 dets 뒤에 class 접미사 추가
export default createService({
  name: '뎃츠 서비스',
  baseURL: '/dets',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllDetsClasses,
    },
    {
      method: 'get',
      path: '/:detsClassId',
      needAuth: true,
      needPermission: false,
      handler: controllers.getDetsClass,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        description: Joi.string().optional(),
        times: Joi.array().items(Joi.string().valid(...TimeValues)).required(),
        speaker: Joi.string().required(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).required(),
        place: Joi.string().required(),
        capacity: Joi.number().required(),
        targetGrade: Joi.number().valid(...GradeValues).required(),
        imageUrl: Joi.string().optional(),
      },
      handler: controllers.createDetsClass,
    },
    {
      method: 'delete',
      path: '/:detsClassId',
      needAuth: true,
      needPermission: true,
      handler: controllers.deleteDetsClass,
    },
    {
      method: 'patch',
      path: '/:detsClassId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        times: Joi.array().items(Joi.string().valid(...TimeValues)).optional(),
        speaker: Joi.string().optional(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).optional(),
        place: Joi.string().optional(),
        capacity: Joi.number().optional(),
        targetGrade: Joi.number().valid(...GradeValues).optional(),
        imageUrl: Joi.string().optional(),
      },
      handler: controllers.editDetsClass,
    },
  ],
});
