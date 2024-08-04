import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CombinedLogger } from '../logger/combined.logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CombinedLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url, ip } = request;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse() || null
        : {
            statusCode: status,
            message: 'Internal server error',
          };

    // Log detailed error information using WinstonLogger
    this.logger.error(
      `${method} ${url} - ${status} - ${ip}ms\nResponse: ${JSON.stringify(
        errorResponse,
      )}`,

      (exception as any).stack || '',
      HttpExceptionFilter.name,
    );

    response.status(status).json(errorResponse);
  }
}
