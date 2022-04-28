import { Middleware, Req } from '@tsed/common';
import { Forbidden, InternalServerError, Unauthorized } from '@tsed/exceptions';
import jwt from "jsonwebtoken";
import { UserRepository } from '../../database/repositores/UserRepository';

@Middleware()
export class AccessTokenMiddleware {
  constructor(
    private userRepository: UserRepository
  ) { }

  async use(@Req() request: Req) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new Unauthorized("Please, provide the access token!");
    }
    let user = null;
    try {
      const decoded = jwt.verify(authorization, process.env.API_SECRET) as any;
      request.headers.loggedUser = decoded.userId;
      request.headers.skwLoggedUser = decoded.skwUserId;
      user = await this.userRepository.findOne(decoded.userId);
    } catch (err) {
      if (err.name == "JsonWebTokenError") {
        throw new Unauthorized("Invalid access token!");
      } else if (err.name == "TokenExpiredError") {
        throw new Forbidden("Expired access token!");
      } else {
        throw new InternalServerError("Can't autenticate, reason: ", err.message);
      }
    }
  }
}