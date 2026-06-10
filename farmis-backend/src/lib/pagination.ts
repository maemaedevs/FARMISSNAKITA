export function parsePagination(params: {
  page?: unknown;
  pageSize?: unknown;
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
}) {
  const defaultPage = params.defaultPage ?? 1;
  const defaultPageSize = params.defaultPageSize ?? 10;
  const maxPageSize = params.maxPageSize ?? 100;

  const page = Number.isFinite(Number(params.page))
    ? Math.max(1, Number(params.page))
    : defaultPage;

  let pageSize = Number.isFinite(Number(params.pageSize))
    ? Math.max(1, Number(params.pageSize))
    : defaultPageSize;
  pageSize = Math.min(maxPageSize, pageSize);

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take };
}

