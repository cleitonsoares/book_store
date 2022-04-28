import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from "../entities/UserEntity";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    findAll() {
        return this.find({
            select: ["id", "name", "email", "password", "created_at", "updated_at"],
            order: {
                created_at: "DESC"
            }
        });
    }
}