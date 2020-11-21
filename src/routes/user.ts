import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { Controller } from '../classes';
import { UserModel } from '../models';
import { reloadAllUsers, attachStudentInfo } from '../resources/dimi-api';
import { checkUserType } from '../middlewares';
import { getUserIdentity } from '../resources/user';
import wrapper from '../resources/wrapper';

class UserController extends Controller {
  public basePath = '/user';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), wrapper(this.getAllUsers));
    this.router.get('/student', checkUserType('*'), wrapper(this.getAllStudents));
    this.router.get('/teacher', checkUserType('*'), wrapper(this.getAllTeachers));
    this.router.get('/reload', wrapper(this.reloadUsers));
    this.router.get('/me', checkUserType('*'), wrapper(this.decodeJWT));
  }

  private getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserModel.find();
    res.json({ users });
  };

  private getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
    let students = await UserModel.findStudents();
    const user = await getUserIdentity(req);
    if (user.userType === 'S') {
      students = students.map((student) => {
        student.photo = [];
        return student;
      });
    }
    res.json({ students });
  };

  private getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
    const teachers = await UserModel.findTeachers();
    res.json({ teachers });
  };

  private decodeJWT = async (req: Request, res: Response, next: NextFunction) => {
    const identity = await getUserIdentity(req);
    res.json({ identity });
  };

  private reloadUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await reloadAllUsers();
      await attachStudentInfo();
      res.end();
    } catch (error) {
      throw new HttpException(500, error.message);
    }
  };
}

export default UserController;
