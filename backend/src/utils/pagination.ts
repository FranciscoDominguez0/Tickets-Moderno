export interface PaginationParams {
  page?:  number | string
  limit?: number | string
}

export interface PaginationMeta {
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface PaginatedResult<T> {
  data:       T[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export function parsePagination(params: PaginationParams): { page: number; limit: number; offset: number } {
  const page   = Math.max(1, Number(params.page)  || 1)
  const limit  = Math.min(50, Math.max(1, Number(params.limit) || 10))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

export function buildPaginatedResult<T>(
  data:   T[],
  total:  number,
  page:   number,
  limit:  number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}