/**
 * Global success interceptor. Wraps every handler return value in the
 * canonical success envelope `{ data, meta: { requestId, timestamp } }`.
 * Handlers return bare data; they never build envelopes. Errors bypass this
 * and are handled by AllExceptionsFilter.
 */
import type { ApiSuccess } from "@migrationtower/contracts";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { nowIso, requestIdOf } from "./request-id.js";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T>> {
    const req = ctx.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: { requestId: requestIdOf(req), timestamp: nowIso() },
      })),
    );
  }
}
