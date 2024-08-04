import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CombinedLogger } from '../logger/combined.logger';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: CombinedLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;

    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `${method} ${url} ${response.statusCode} - ${responseTime}ms`,
          context.getClass().name,
        );
        return data;
      }),
    );
  }
}
