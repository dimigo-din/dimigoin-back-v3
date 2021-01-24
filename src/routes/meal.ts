import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getAllMeals,
  createMeal,
  getMealByDate,
  editMealByDate,
} from '../controllers/meal';
import wrapper from '../resources/wrapper';

class MealController extends Controller {
  public basePath = '/meal';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), wrapper(getAllMeals));

    this.router.get('/:date', wrapper(getMealByDate));

    this.router.post('/', checkUserType('T', 'S'), validator(Joi.object({
      date: Joi.date().required(),
      breakfast: Joi.array().items(Joi.string()).required(),
      lunch: Joi.array().items(Joi.string()).required(),
      dinner: Joi.array().items(Joi.string()).required(),
    })), wrapper(createMeal));

    this.router.patch('/:date', checkUserType('T'), validator(Joi.object({
      breakfast: Joi.array().items(Joi.string()),
      lunch: Joi.array().items(Joi.string()),
      dinner: Joi.array().items(Joi.string()),
    })), wrapper(editMealByDate));
  }
}

export default MealController;
