import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { ICircleApplication } from '../../interfaces';
import {
  CircleApplicationModel,
  CircleApplicationQuestionModel,
  CircleModel,
} from '../../models';
import { ConfigKeys, CirclePeriod } from '../../types';
import { getUserIdentity } from '../../resources/user';
import { getConfig, getEntireConfigs } from '../../resources/config';

export const getApplicationStatus = async (req: Request, res: Response) => {
  const period = await getConfig(ConfigKeys.circlePeriod);
  const user = await getUserIdentity(req);
  const applications = await CircleApplicationModel.findByApplier(user._id);
  const mappedApplications = await Promise.all(
    applications.map(async (application) => {
      if (period === CirclePeriod.application) application.status = 'applied';
      else if (period === CirclePeriod.interview
              && application.status.includes('interview')) {
        application.status = 'document-pass';
      }
      const circle = await CircleModel.findById(application.circle)
        .populate('chair', ['name', 'serial'])
        .populate('viceChair', ['name', 'serial']);
      application.circle = circle;
      return application;
    }),
  );
  res.json({
    maxApplyCount: getConfig(ConfigKeys.circleMaxApply),
    applications: mappedApplications,
  });
};

export const createApplication = async (req: Request, res: Response) => {
  const config = await getEntireConfigs();

  if (config[ConfigKeys.circlePeriod] !== 'APPLICATION') {
    throw new HttpException(406, '동아리 지원 기간이 아닙니다.');
  }

  const user = await getUserIdentity(req);
  const applied = await CircleApplicationModel.findByApplier(user._id);
  const application: ICircleApplication = req.body;
  application.applier = user._id;

  if (applied.length >= config[ConfigKeys.circleMaxApply]) {
    throw new HttpException(423, '지원 가능한 동아리 개수를 초과해 지원했습니다.');
  }

  if (applied.map((v) => v.circle.toString()).includes(application.circle.toString())) {
    throw new HttpException(409, '같은 동아리에 두 번 이상 지원할 수 없습니다.');
  }

  const answeredIds: string[] = Object.keys(application.form).sort();
  const questions = await CircleApplicationQuestionModel.find();
  const questionIds = questions.map((v) => v._id.toString()).sort();
  if (JSON.stringify(answeredIds) !== JSON.stringify(questionIds)) {
    throw new HttpException(400, '지원서 양식이 올바르지 않습니다.');
  }

  const invalidAnswers = questions.filter((question) => {
    const id: string = question._id.toString();
    const answer: string = application.form[id];
    return question.maxLength < answer.length || answer.length === 0;
  });
  if (invalidAnswers.length > 0) {
    throw new HttpException(400, '지원서 양식이 올바르지 않습니다.');
  }
  const newCircleApplication = new CircleApplicationModel();
  Object.assign(newCircleApplication, application);
  await newCircleApplication.save();
  res.json({ application });
};

export const finalSelection = async (req: Request, res: Response) => {
  const user = await getUserIdentity(req);
  const applied = await CircleApplicationModel.findByApplier(user._id);

  if (applied.filter((v) => v.status === 'final').length > 0) {
    throw new HttpException(409, '이미 최종 결정을 한 지원자입니다.');
  }

  const final = applied.find((v) => v.circle.toString() === req.params.circleId);

  if (!final) throw new HttpException(404, '해당 지원서가 존재하지 않습니다.');

  const period = await getConfig(ConfigKeys.circlePeriod);

  if (period !== CirclePeriod.final || final.status !== 'interview-pass') {
    throw new HttpException(403, '합격한 동아리에만 최종 선택을 할 수 있습니다.');
  }

  final.status = 'final';
  await final.save();
  res.json({ application: final });
};
