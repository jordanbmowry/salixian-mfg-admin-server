import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequestBody(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}
