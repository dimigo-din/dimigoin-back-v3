import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  createPlace,
  getAllPlaces,
  getPlace,
  editPlace,
  deletePlace,
} from '../controllers/place';

class PlaceController extends Controller {
  public basePath = '/place';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), getAllPlaces);
    this.router.patch('/:placeId', checkUserType('T'), validator(Joi.object({
      name: Joi.string(),
      location: Joi.string(),
      description: Joi.string(),
    })), editPlace);
    this.router.post('/', checkUserType('T'), validator(Joi.object({
      name: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
    })), createPlace);
    this.router.get('/:placeId', checkUserType('*'), getPlace);
    this.router.delete('/:placeId', checkUserType('T'), deletePlace);
  }
}

export default PlaceController;
