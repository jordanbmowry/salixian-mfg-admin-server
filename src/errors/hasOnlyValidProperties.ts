import { Request, Response, NextFunction } from 'express';

function hasOnlyValidProperties(
  ...validProperties: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req, res, next) {
    const { data = {} } = req.body as { data?: Record<string, any> };

    const invalidFields = Object.keys(data).filter(
      (field) => !validProperties.includes(field)
    );

    if (invalidFields.length) {
      const error = new Error(`Invalid field(s): ${invalidFields.join(', ')}`);
      (error as any).status = 400; // Adding custom property to Error object
      return next(error);
    }
    next();
  };
}

export default hasOnlyValidProperties;
