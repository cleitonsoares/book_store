import { EntityRepository, ILike, Repository } from "typeorm";
import { AuthorEntity } from "../entities/AuthorEntity";

@EntityRepository(AuthorEntity)
export class AuthorRepository extends Repository<AuthorEntity> {
    findAll() {
        return this.find({
            order: {
                created_at: "DESC"
            }
        });
    }

    // find or persist author
    async checkByName(name: string): Promise<AuthorEntity> {

        let author = await this.findOne({
            where: {
                name: ILike(name.trim())
            }
        });

        if (author == null) {
            author = await this.save(this.create({ name: name.trim() }));
        }

        return author;
    }
}