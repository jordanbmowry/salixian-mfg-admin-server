import { Request, Response, NextFunction } from 'express';
import knex from '../db/connection';
import { AppError } from './AppError';
import { HttpStatusCode } from './httpStatusCode';
import { logMethod } from '../config/logMethod';

interface CheckDuplicateOptions {
  table: string;
  fields: string[];
  primaryKey: string;
  paramKey: string;
}

export function checkDuplicate({
  table,
  fields,
  primaryKey,
  paramKey,
}: CheckDuplicateOptions) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    logMethod(req, 'checkDuplicate');

    try {
      const entityId = req.params[paramKey]; // Change this line

      const queries = fields.map((field) => {
        const value = req.body.data[field];

        let query = knex(table).where({ [field]: value });

        // Add the condition only if entityId is defined
        if (entityId) {
          query = query.whereNot({ [primaryKey]: entityId });
        }

        return query.first().then((result) => ({ field, result }));
      });

      const results = await Promise.all(queries);

      const duplicateFields = results
        .filter(({ result }) => result !== undefined)
        .map(({ field }) => field);

      if (duplicateFields.length > 0) {
        next(
          new AppError(
            HttpStatusCode.BAD_REQUEST,
            `Record(s) with the following fields already exists: ${duplicateFields.join(
              ', '
            )}.`
          )
        );
        return;
      }

      next();
    } catch (error) {
      req.log.error(error);
      next(
        new AppError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          'An error occurred while checking for duplicate records.'
        )
      );
    }
  };
}
