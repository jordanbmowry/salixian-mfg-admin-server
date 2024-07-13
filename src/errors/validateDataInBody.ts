import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logMethod } from '../config/logMethod';
import { HttpStatusCode } from './httpStatusCode';
import { AppError } from './AppError';

export function validateDataInBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    logMethod(req, 'validateDataInBody');
    const { error } = schema.validate(req.body.data);
    if (error) {
      const message = error.details?.[0]?.message || 'Invalid request data.';
      return next(new AppError(HttpStatusCode.BAD_REQUEST, `${message}.`));
    }
    next();
  };
}
