import { createSchema, Type, typedModel } from 'ts-mongoose';

const permissionSchema = createSchema({
  userId: Type.number({ required: true }),
  permissions: Type.array({ select: false, default: [] }).of(Type.string()),
}, { versionKey: false, timestamps: false });

const PermissionModel = typedModel('Permission', permissionSchema);
export {
  permissionSchema,
  PermissionModel,
};
