import { Knex } from 'knex';
import type { PaginationResult, PaginationOptions } from '../types/types';

export async function paginate<T>(
  query: Knex.QueryBuilder,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;

  const clonedQuery = query.clone();
  const totalCountQuery = clonedQuery.clone().count('* as count').first();
  const dataQuery = clonedQuery.limit(pageSize).offset((page - 1) * pageSize);

  const [totalCountResult, data] = await Promise.all([
    totalCountQuery,
    dataQuery,
  ]);

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.count as string, 10)
    : 0;

  return {
    data: data as T[],
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / pageSize),
    pageSize,
  };
}
