import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { RequestWithUser } from "../../../common/request-with-user.interface.js";

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();

  return request.user;
});
