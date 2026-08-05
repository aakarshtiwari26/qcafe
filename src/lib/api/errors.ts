import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Invalid input",
    public issues?: Record<string, string[]>
  ) {
    super(message, 422, "VALIDATION_ERROR");
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const issues: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".") || "_root";
      issues[path] = [...(issues[path] ?? []), issue.message];
    }
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues } },
      { status: 422 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && error.issues ? { issues: error.issues } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "A record with these details already exists" } },
      { status: 409 }
    );
  }

  console.error("[unhandled_api_error]", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } },
    { status: 500 }
  );
}
