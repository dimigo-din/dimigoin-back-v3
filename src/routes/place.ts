import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  createPlace,
  getAllPlaces,
  getPlace,
  editPlace,
  deletePlace,
  getPrimaryPlaces,
} from '../controllers/place';
import wrapper from '../resources/wrapper';

class PlaceController extends Controller {
  public basePath = '/place';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), wrapper(getAllPlaces));
    this.router.get('/primary', checkUserType('S'), wrapper(getPrimaryPlaces));
    this.router.patch('/:placeId', checkUserType('*'), validator(Joi.object({ //
      name: Joi.string(),
      location: Joi.string(),
      description: Joi.string(),
    })), wrapper(editPlace));
    this.router.post('/', checkUserType('*'), validator(Joi.object({ //
      name: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string(),
    })), wrapper(createPlace));
    this.router.get('/:placeId', checkUserType('*'), wrapper(getPlace));
    this.router.delete('/:placeId', checkUserType('*'), wrapper(deletePlace)); //
  }
}

export default PlaceController;
