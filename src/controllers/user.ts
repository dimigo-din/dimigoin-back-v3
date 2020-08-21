import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { UserModel } from '../models';
import DimiAPI from '../resources/dimi-api';
import { checkUserType } from '../middlewares';

class UserController extends Controller {
  public basePath = '/user';

  private DimiAPIClient = new DimiAPI();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), this.getAllUsers);
    this.router.get('/student', checkUserType('*'), this.getAllStudents);
    this.router.get('/teacher', checkUserType('*'), this.getAllTeachers);
    this.router.get('/reload', checkUserType('*'), this.reloadUsers);
    this.router.get('/me', checkUserType('*'), this.decodeJWT);
  }

  private getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserModel.find();
    res.json({ users });
  }

  private getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
    let students = await UserModel.findStudents();
    const user = this.getUserIdentity(req);
    if (user.userType === 'S') {
      students = students.map((student) => {
        student.photo = [];
        return student;
      });
    }
    res.json({ students });
  }

  private getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
    const teachers = await UserModel.findTeachers();
    res.json({ teachers });
  }

  private decodeJWT = async (req: Request, res: Response, next: NextFunction) => {
    const identity = this.getUserIdentity(req);
    res.json({ identity });
  }

  private reloadUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.DimiAPIClient.reloadAllUsers();
      await this.DimiAPIClient.attachStudentInfo();
      res.end();
    } catch (error) {
      throw new HttpException(500, error.message);
    }
  }
}

export default UserController;
