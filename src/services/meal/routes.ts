import Joi from 'joi';
import * as controllers from './controllers';

export default {
  baseURL: '/meal',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: '*',
      handler: controllers.getAllMeals,
    },
    {
      method: 'get',
      path: '/weekly',
      handler: controllers.getWeeklyMeals,
    },
    {
      method: 'get',
      path: '/:date',
      handler: controllers.getMealByDate,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['T', 'S'],
      validateSchema: {
        date: Joi.date().required(),
        breakfast: Joi.array().items(Joi.string()).required(),
        lunch: Joi.array().items(Joi.string()).required(),
        dinner: Joi.array().items(Joi.string()).required(),
      },
      handler: controllers.createMeal,
    },
    {
      method: 'patch',
      path: '/:date',
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
