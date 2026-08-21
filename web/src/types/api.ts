export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}
