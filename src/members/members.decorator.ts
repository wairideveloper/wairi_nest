import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data, ExecutionContext) => {
  const req = ExecutionContext.switchToHttp().getRequest();
  return req.user;
});
