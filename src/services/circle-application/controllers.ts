import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import {
  CircleModel,
  CircleApplicationModel,
  CircleApplicationQuestionModel,
  UserModel,
} from '../../models';
import { ConfigKeys, CirclePeriod } from '../../types';
import { getConfig, getEntireConfigs } from '../../resources/config';

export const getApplicationStatus = async (req: Request, res: Response) => {
  const period = await getConfig(ConfigKeys.circlePeriod);
  const applications = await CircleApplicationModel.find({
    applier: req.user._id,
  }).populateTs('circle');

  const mappedApplications = applications.map((application) => {
    // 지원 기간에는 서류 전형 상태가 비공개임
    // 따라서 사용자에게는 지원 완료 상태로 보여야 함
    if (period === CirclePeriod.application) {
      application.status = 'applied';
    }
    // 면접 기간에는 면접 전형 상태가 비공개임
    // 면접 결과가 있는 학생은 서류 전형에서는 합격이므로 전 단계 결과인 서류 합격 상태로 보여야 함
    // 면접 결과가 없을 경우 서류 전형 탈락이므로 상태가 그대로 보여도 됨
    else if (
      period === CirclePeriod.interview
      && application.status.includes('interview')
    ) {
      application.status = 'document-pass';
    }
    // 최종 결정 기간에는 면접 결과 혹은 최종 결정 상태가 반환됨
    return application;
  });

  res.json({
    maxApplyCount: await getConfig(ConfigKeys.circleMaxApply),
    applications: mappedApplications,
  });
};

// 동아리장이 자신의 동아리 지원자가 함께 지원한 동아리 목록을 불러옴
export const getApplicationsByApplier = async (req: Request, res: Response) => {
  const circle = await CircleModel.findByChairs(req.user._id);
  const applier = await UserModel.findById(req.params.applierId);
  if (!applier) throw new HttpException(404, '해당 지원자를 찾을 수 없습니다.');
  const application = await CircleApplicationModel.findOne({
    circle: circle._id,
    applier: applier._id,
  });
  if (!application) throw new HttpException(403, '자신의 동아리에 지원자에 대한 정보만 확인할 수 있습니다.');

  const appliedCircles = await CircleApplicationModel.find({
    applier: applier._id,
  }).select('circle').populateTs('circle');

  res.json({ circles: appliedCircles });
};

export const getApplicationForm = async (req: Request, res: Response) => {
  const form = await CircleApplicationQuestionModel.find();
  res.json({ form });
};

export const createApplication = async (req: Request, res: Response) => {
  const config = await getEntireConfigs();

  if (config[ConfigKeys.circlePeriod] !== 'APPLICATION') {
    throw new HttpException(406, '동아리 지원 기간이 아닙니다.');
  }

  const { user } = req;
  const applications = (await CircleApplicationModel.findByApplier(user._id))
    .map((a) => a.circle.toString());

  // 최대 신청 동아리 개수 이내인지 검증
  if (applications.length >= config[ConfigKeys.circleMaxApply]) {
    throw new HttpException(423, '지원 가능한 동아리 개수를 초과해 지원했습니다.');
  }

  // 같은 동아리에 지원한 적이 있는지 검증
  if (applications.includes(req.body.circle)) {
    throw new HttpException(409, '같은 동아리에 두 번 이상 지원할 수 없습니다.');
  }

  // 지정된 지원서 양식과 일치하는지 확인
  const answeredIds = Object.keys(req.body.form).sort();
  const questions = await CircleApplicationQuestionModel.find();
  const questionIds = questions.map((v) => v._id.toString()).sort();
  if (JSON.stringify(answeredIds) !== JSON.stringify(questionIds)) {
    throw new HttpException(400, '지원서 양식이 올바르지 않습니다.');
  }

  // 각 답변이 최대 글자수 이내인지 검증
  const invalidAnswers = questions.filter((question) => {
    const answer = req.body.form[question.id];
    return question.maxLength < answer.length || answer.length === 0;
  });
  if (invalidAnswers.length > 0) {
    throw new HttpException(400, '지원서 양식이 올바르지 않습니다.');
  }

  const circleApplication = await new CircleApplicationModel({
    ...req.body,
    applier: user._id,
  }).save();
  res.json({ circleApplication });
};

export const finalSelection = async (req: Request, res: Response) => {
  const { user } = req;
  const applications = await CircleApplicationModel.findByApplier(user._id);

  if (applications.filter((v) => v.status === 'final').length > 0) {
    throw new HttpException(409, '이미 최종 결정을 했습니다.');
  }

  const final = applications.find((v) => v._id.toString() === req.params.applicationId);

  if (!final) throw new HttpException(404, '최종 결정을 하려는 동아리에 지원한 이력이 없습니다.');

  const period = await getConfig(ConfigKeys.circlePeriod);
  // 최종 결정 기간이 아닐 경우 면접 전형 결과가 비공개이기 때문에 불합격 Response 전송
  if (period !== CirclePeriod.final || final.status !== 'interview-pass') {
    throw new HttpException(403, '합격한 동아리에만 최종 선택을 할 수 있습니다.');
  }

  final.status = 'final';
  await final.save();
  res.json({ application: final });
};
