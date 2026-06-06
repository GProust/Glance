export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode, status: number, isOperational = true) {
    super(message);
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, ErrorCode.NOT_FOUND, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, ErrorCode.BAD_REQUEST, 400);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429);
  }
}

export function handleError(err: unknown) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: {
        code: err.code,
        message: err.message,
      },
    };
  }

  console.error('Unexpected error:', err);

  return {
    status: 500,
    body: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
    },
  };
}
