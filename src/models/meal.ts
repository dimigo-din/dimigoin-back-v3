import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

// const mealContentSchema = Type.object({ require: true }).of({
//   content: Type.array({ required: true }).of(Type.string()),
//   // image: Type.objectId({ default: null }),
// });

const mealContentSchema = Type.array({ required: true }).of(Type.string());

const mealSchema = createSchema({
  date: Type.string({ required: true, unique: true }),
  breakfast: mealContentSchema,
  lunch: mealContentSchema,
  dinner: mealContentSchema,
}, { versionKey: false, timestamps: true });

const MealModel = typedModel('Meal', mealSchema);

export {
  mealSchema,
  MealModel,
};
