import { Catch, PlatformContext, ExceptionFilterMethods, ResponseErrorObject, $log } from '@tsed/common';
import { Exception } from '@tsed/exceptions';

@Catch(Exception)
export class HttpExceptionFilter implements ExceptionFilterMethods {
  catch(exception: Exception, ctx: PlatformContext) {
    const { response } = ctx;
    const error = this.mapError(exception);
    const headers = this.getHeaders(exception);

    $log.error({ error });

    response
      .setHeaders(headers)
      .status(exception.status)
      .body(error);
  }

  mapError(error: any) {
    return {
      message: error.message || 'Ops... Someting got wrong, please, try again later.',
    };
  }

  protected getErrors(error: any) {
    return [error, error.origin].filter(Boolean).reduce((errs, { errors }: ResponseErrorObject) => [...errs, ...(errors || [])], []);
  }

  protected getHeaders(error: any) {
    return [error, error.origin].filter(Boolean).reduce((obj, { headers }: ResponseErrorObject) => ({
      ...obj,
      ...(headers || {})
    }), {});
  }
}
