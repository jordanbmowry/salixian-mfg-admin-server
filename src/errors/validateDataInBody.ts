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
      return next(
        new AppError(HttpStatusCode.BAD_REQUEST, `${error.details[0].message}.`)
      );
    }
    next();
  };
}
