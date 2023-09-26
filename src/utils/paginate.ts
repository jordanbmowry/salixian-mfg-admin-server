import { Knex } from 'knex';
import type { PaginationResult, PaginationOptions } from '../types/types';

export async function paginate<T>(
  query: Knex.QueryBuilder,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;

  // Execute the total count query
  const totalCountResult = await query
    .clone()
    .clearOrder()
    .clearSelect()
    .count('* as count')
    .first();

  // Parsing the count result
  const totalCount = totalCountResult
    ? parseInt(totalCountResult.count as string, 10)
    : 0;

  // Perform manual pagination using limit and offset
  const data = await query
    .clone()
    .orderBy(options.orderBy || 'id', options.order || 'asc')
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Returning the pagination result
  return {
    data: data as T[],
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / pageSize),
    pageSize,
  };
}
