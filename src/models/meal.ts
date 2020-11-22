import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

const mealSchema = createSchema({
  date: Type.date({ required: true, unique: true }),
  breakfast: Type.array({ required: true }).of(Type.string()),
  lunch: Type.array({ required: true }).of(Type.string()),
  dinner: Type.array({ required: true }).of(Type.string()),
}, { versionKey: false, timestamps: true });

const MealModel = typedModel('Meal', mealSchema);

export {
  mealSchema,
  MealModel,
};
