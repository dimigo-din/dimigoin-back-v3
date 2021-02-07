import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '식단표 서비스',
  baseURL: '/meal',
  routes: [
    {
      method: 'get',
      path: '/weekly',
      handler: controllers.getWeeklyMeals,
    },
    {
      method: 'get',
      path: '/today',
      handler: controllers.getTodayMeal,
    },
    {
      method: 'get',
      path: '/date/:date',
      handler: controllers.getMealByDate,
    },
    {
      method: 'post',
      path: '/date/:date',
      allowedUserTypes: ['T', 'S'],
      validateSchema: {
        breakfast: Joi.array().items(Joi.string()).required(),
        lunch: Joi.array().items(Joi.string()).required(),
        dinner: Joi.array().items(Joi.string()).required(),
      },
      handler: controllers.createMeal,
    },
    {
      method: 'patch',
      path: '/date/:date',
      allowedUserTypes: ['T'],
      validateSchema: {
        date: Joi.date(),
        breakfast: Joi.array().items(Joi.string()),
        lunch: Joi.array().items(Joi.string()),
        dinner: Joi.array().items(Joi.string()),
      },
      handler: controllers.editMealByDate,
    },
  ],
};
