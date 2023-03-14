import Joi from 'joi';
import * as controllers from './controllers';
import {
  AfterschoolTimeValues, ClassValues, DayValues, GradeValues, NightTimeValues,
} from '../../types';
import { createService } from '../index';

export default createService({
  name: '방과후 수업 서비스',
  baseURL: '/afterschool',
  routes: [
    {
      method: 'get',
      path: '/',
      description: '모든 방과후 과목을 불러옵니다.',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllAfterschools,
    },
    {
      method: 'get',
      path: '/:afterschoolId',
      description: '선택된 방과후 과목을 불러옵니다.',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAfterschool,
    },
    {
      method: 'post',
      path: '/',
      description: '새 방과후 과목을 생성합니다.',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        description: Joi.string().required(),
        targetGrades: Joi.array().items(Joi.number().valid(...GradeValues)).min(1).max(3)
          .required(),
        targetClasses: Joi.array().items(Joi.number().valid(...ClassValues)).min(1).max(6)
          .required(),
        key: Joi.string().optional(),
        teacher: Joi.number().required(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).required(),
        times: Joi.array().items(Joi.string().valid(...AfterschoolTimeValues, NightTimeValues)).required(), // 2023년부터 야자에도 방과후한다네요
        capacity: Joi.number().required(),
        place: Joi.string().required(),
      },
      handler: controllers.createAfterschool,
    },
    {
      method: 'delete',
      path: '/:afterschoolId',
      description: '선택된 방과후 과목을 삭제합니다.',
      needAuth: true,
      needPermission: true,
      handler: controllers.deleteAfterschool,
    },
    {
      method: 'patch',
      path: '/:afterschoolId',
      description: '선택된 방과후 과목을 수정합니다.',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        targetGrades: Joi.array().items(Joi.number().valid(...GradeValues)).min(1).max(3)
          .optional(),
        targetClasses: Joi.array().items(Joi.number().valid(...ClassValues)).min(1).max(6)
          .optional(),
        key: Joi.string().optional(),
        teacher: Joi.string().optional(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).optional(),
        times: Joi.array().items(Joi.string().valid(...AfterschoolTimeValues)).optional(),
        capacity: Joi.number().optional(),
        place: Joi.string().optional(),
      },
      handler: controllers.editAfterschool,
    },
  ],
});
