import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: unknown) => ({
        data,
        meta: { apiVersion: 'v1', timestamp: new Date().toISOString() },
      })),
    );
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const raw =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const body =
      typeof raw === 'object' && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    const code =
      typeof body.code === 'string'
        ? body.code
        : status >= 500
          ? 'INTERNAL_ERROR'
          : 'REQUEST_FAILED';
    const message =
      typeof body.message === 'string'
        ? body.message
        : status >= 500
          ? 'An unexpected error occurred'
          : 'Request failed';
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? randomUUID();
    response.status(status).json({
      error: { code, message, traceId: requestId },
      meta: { apiVersion: 'v1', timestamp: new Date().toISOString() },
    });
  }
}
