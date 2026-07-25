import type { Request } from "express";

import type { RequestUser } from "../modules/auth/types/request-user.type.js";

export type RequestWithUser = Request & {
  user?: RequestUser;
};
