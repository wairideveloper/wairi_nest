import {ArgumentsHost, ExecutionContext, HttpException, Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

@Injectable()
export class GqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlExecutionContext.create(<ExecutionContext>host);
    const context = gqlHost.getContext();

    if (exception instanceof HttpException) {
      return exception; // HTTP 예외는 그대로 반환
    }

    // GraphQL 예외에 대한 커스터마이즈된 응답
    const gqlResponse = {
      statusCode: exception.status || 500,
      message: exception.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: context.req.url,
    };

    return gqlResponse;
  }
}
