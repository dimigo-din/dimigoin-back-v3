import { createSchema, Type, typedModel } from 'ts-mongoose';
import * as Afterschool from './afterschool';
import * as User from './user';
import { ObjectId } from 'mongodb';

export const schema = createSchema({
  applier: Type.ref(Type.objectId()).to('User', User.schema),
  afterschool: Type.ref(Type.objectId()).to('Afterschool', Afterschool.schema),
}, { versionKey: false, timestamps: true });

export const model = typedModel('AfterschoolApplication', schema)

const checkOverlap = async (applierId: ObjectId, targetId: ObjectId): Promise<Boolean> => {
  const target = await Afterschool.model.findById(targetId);

  // const application = await AfterschoolApplicationModel
  //   .findOne({
  //     applier: applierId,
  //     'afterschool.key': afterschool.key,
  //     'afterschool.day': { $all: afterschool.day },
  //     'afterschool.time': { $all: afterschool.time },
  //   })
  //   .populate('afterschool');
  // TODO: 저 위에 거가 자꾸 안 돼서 우선 아래 걸로
  
  return !!(await model
    .find({ applier: applierId })
    .populateTs('afterschool'))
    .filter(({ afterschool }) => (
      afterschool.key === target.key
      || (
        afterschool.day.filter((day) => target.day.includes(day)).length
        && afterschool.time.filter((time) => target.time.includes(time)).length
      )
    ));
};

export {
  checkOverlap,
};
