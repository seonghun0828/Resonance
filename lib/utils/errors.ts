/**
 * Custom error classes for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class OpenAIError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'OPENAI_ERROR', statusCode);
    this.name = 'OpenAIError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
