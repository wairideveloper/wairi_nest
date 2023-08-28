import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, ExecutionContext} from '@nestjs/common';
import {Request, response, Response} from 'express';
import {GqlContextType, GqlExceptionFilter, GqlExecutionContext} from "@nestjs/graphql";

/**
 * @Catch(HttpException)
 * 해당 데코레이터는 필요한 메타 데이터를 ExceptionFilter에 바인딩하여,
 * 필터가 HttpException 타입의 예외만 찾고 있다는 것을 Nset.js에 알리기 위해 선언한다.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
    catch(exception: HttpException, host: ExecutionContext) {
        let ctx
        if (host.getType() === 'http') {
            ctx = host.switchToHttp();
            const req = ctx.getRequest();
            const res = ctx.getResponse();
            // console.log("-> res", res);
            res.status(exception.getStatus()).json({
                errors : [{
                  // message : exception.getResponse()['message'] || exception.message,
                  // code : exception.getResponse()['code'] || exception.getStatus(),
                  // name : exception.getResponse()['name'] || exception.name,
                }],
                // statusCode: exception.getStatus(),
                // error: exception.getResponse()['error'] || exception.name,
                // message: exception.getResponse()['message'] || exception.message,
                // timestamps: new Date().toISOString(),
                // path: req ? req.url : null,
            });
        } else if (host.getType() === 'rpc') {
            // do something that is only important in the context of Microservice requests
        } else if (host.getType<GqlContextType>() === 'graphql') {
            // do something that is only important in the context of GraphQL requests
            ctx = GqlExecutionContext.create(host);
            // 오류 커스텀 코드
            const gqlHost = GqlExecutionContext.create(host);
            const gqlResponse = gqlHost.getContext().res;
            const gqlRequest = gqlHost.getContext().req;
            const gqlStatus = exception.getStatus();
            const gqlError = exception.getResponse()['error'] || exception.name;
            const gqlMessage = exception.getResponse()['message'] || exception.message;
            const gqlTimestamps = new Date().toISOString();
            const gqlPath = gqlRequest ? gqlRequest.url : null;
            gqlResponse.status(gqlStatus).json({
                errors : [{
                    message : gqlMessage,
                    code : gqlStatus,
                    name : gqlError,
                }]
            });

        }
    }

    /**
     * @description 예외 처리 함수
     * @param exception 현재 처리 중인 예외 객체
     * @param host ArgumentsHost 객체 -> 핸들러에 전달되는 인수를 검색하는 메서드를 제공한다 (Express를 사용하는 경우 - Response & Request & Next 제공)
     */
//     catch(exception: HttpException, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse();
//         const request = ctx.getRequest();
//
//         const status =
//             exception instanceof HttpException
//                 ? exception.getStatus()
//                 : HttpStatus.INTERNAL_SERVER_ERROR;
//
//         /**
//          * @description HttpException에서 전송한 데이터를 추출할 때 사용
//          */
//         const res: any = exception.getResponse();
// console.log(ctx.getResponse());
// console.log(exception.getResponse());
//
//         //요청 url 및 에러 정보
//         // const url: string = request.url;
//         const error: string = res.error;
//         const timestamp: string = new Date().toISOString();
//
//         // console.log('url : ', url);
//         console.log('error 정보 : ', res.message);
//         console.log('발생 시간 : ', timestamp);
//
//         /* 클라이언트에게 정보를 전달한다. */
//         response.status(res.statusCode).json({
//             success: false,
//             message: res.message,
//         });
//
//
// //         const ctx = host.switchToHttp();
// //         const response = ctx.getResponse<Response>();
// //         const request = ctx.getRequest<Request>();
// //         const status = exception.getStatus();
// // console.log(status)
// // console.log(request)
// //         return {'false': 'false'};
// //         response
// //             .status(status)
// //             .json({
// //                 statusCode: status,
// //                 timestamp: new Date().toISOString(),
// //                 path: request.url,
// //             });
//     }
}