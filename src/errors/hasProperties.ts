import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './AppError';

function hasProperties(
  ...properties: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req, res, next) {
    const schema = Joi.object().keys(
      Object.fromEntries(properties.map((prop) => [prop, Joi.any().required()]))
    );

    const { error } = schema.validate(req.body.data);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      const validationError = new AppError(400, errorMessage);
      return next(validationError);
    }
    next();
  };
}

export default hasProperties;
