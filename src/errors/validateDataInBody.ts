import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateDataInBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body.data);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}
