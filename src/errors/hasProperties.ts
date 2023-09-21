import { Request, Response, NextFunction } from 'express';

function hasProperties(
  ...properties: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req, res, next) {
    const { data = {} } = req.body as { data?: Record<string, any> };

    try {
      properties.forEach((property) => {
        if (data[property] === undefined) {
          const error = new Error(`A '${property}' property is required.`);
          (error as any).status = 400;
          throw error;
        }
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

export default hasProperties;
