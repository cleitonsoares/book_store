import { Controller } from "@tsed/di";
import { BadRequest, Forbidden, Unauthorized } from "@tsed/exceptions";
import { BodyParams } from "@tsed/platform-params";
import { Post } from "@tsed/schema";
import { UserRepository } from "../../database/repositores/UserRepository";
import { LoginRequestDTO } from "../../dtos/LoginRequestDTO";
import { CryptService } from "../../services/CryptService";

@Controller("/auth")
export class AuthController {
  constructor(
    private userRepository: UserRepository,
    private cryptService: CryptService
  ) { }

  @Post("/login")
  async doLogin(@BodyParams() body: LoginRequestDTO) {
    if (!body.email || !body.password) {
      throw new BadRequest("Provide the credentials, mail and password!");
    }
    const findUser = await this.userRepository.findOne({
      where: {
        email: body.email
      },
    });
    if (!findUser) {
      throw new Unauthorized("Invalid credentials!");
    }
    const hashedPassword = this.cryptService.generataSHA256(body.password);
    if (hashedPassword != findUser.password) {
      throw new Forbidden("Invalid credentials!");
    }

    return {
      user: findUser,
      jwt: this.cryptService.generateJWT({ userId: findUser.id }),
    }
  }
}