import { Request, Response, NextFunction } from 'express';
import knex from '../db/connection';
import { AppError } from './AppError';
import { HttpStatusCode } from './httpStatusCode';

interface CheckDuplicateOptions {
  table: string;
  fields: string[];
}

export function checkDuplicate({ table, fields }: CheckDuplicateOptions) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const queries = fields.map((field) => {
        const value = req.body.data[field];
        return knex(table)
          .where({ [field]: value })
          .first()
          .then((result) => ({ field, result }));
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
