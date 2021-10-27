import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

const mealContentSchema = Joi.array().items(Joi.string());

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
      method: 'post',
      path: '/weekly',
      needAuth: true,
      needPermission: true,
      validateSchema:
      {
        weeklyMeals: Joi.array().items({
          date: Joi.string().required(), // YYYY-MM-DD
          meals: {
            breakfast: mealContentSchema,
            lunch: mealContentSchema,
            dinner: mealContentSchema,
          },
        }),
      },
      handler: controllers.createWeeklyMeal,
    },
    {
      method: 'patch',
      path: '/date/:date',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        breakfast: mealContentSchema,
        lunch: mealContentSchema,
        dinner: mealContentSchema,
      },
      handler: controllers.editMealByDate,
    },
    {
      method: 'post',
      path: '/xlsxfile',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        breakfast: mealContentSchema,
        lunch: mealContentSchema,
        dinner: mealContentSchema,
      },
      handler: controllers.editMealByDate,
    },
  ],
});
