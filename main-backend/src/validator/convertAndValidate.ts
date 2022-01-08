import { ClassConstructor, plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";

export const convertAndValidate = async <T extends {}>(
  body: T | any,
  type: ClassConstructor<T>
): Promise<T> => {
  const parsed = plainToClass(type, body);
  await validateOrReject(parsed);
  return parsed;
};
