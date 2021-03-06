import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

const mealContentSchema = Joi.object({
  menu: Joi.array().items(Joi.string()).required(),
  image: Joi.string().optional(),
}).required();

export default createService({
  name: '식단표 서비스',
  baseURL: '/meal',
  routes: [
    {
      method: 'get',
      path: '/weekly',
      needAuth: false,
      needPermission: false,
      handler: controllers.getWeeklyMeals,
    },
    {
      method: 'get',
      path: '/today',
      needAuth: false,
      needPermission: false,
      handler: controllers.getTodayMeal,
    },
    {
      method: 'get',
      path: '/date/:date',
      needAuth: false,
      needPermission: false,
      handler: controllers.getMealByDate,
    },
    {
      method: 'post',
      path: '/date/:date',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        breakfast: mealContentSchema,
        lunch: mealContentSchema,
        dinner: mealContentSchema,
      },
      handler: controllers.createMeal,
    },
    {
      method: 'patch',
      path: '/date/:date',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        date: Joi.date(),
        breakfast: Joi.array().items(Joi.string()),
        lunch: Joi.array().items(Joi.string()),
        dinner: Joi.array().items(Joi.string()),
      },
      handler: controllers.editMealByDate,
    },
  ],
});
