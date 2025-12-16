import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

type ClassType<T> = new () => T;

export async function validateDto<T extends object>(
  cls: ClassType<T>,
  payload: unknown
): Promise<T> {
  const instance = plainToInstance(cls, payload);
  const errors = await validate(instance as object, { whitelist: true, forbidUnknownValues: true });
  if (errors.length > 0) {
    const messages = errors.flatMap(err => Object.values(err.constraints ?? {}));
    const message = messages.join('; ') || 'Validation failed';
    throw Object.assign(new Error(message), { status: 400 });
  }
  return instance;
}
