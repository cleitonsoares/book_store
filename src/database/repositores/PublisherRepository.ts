import { EntityRepository, ILike, Repository } from "typeorm";
import { PublisherEntity } from "../entities/PublisherEntity";

@EntityRepository(PublisherEntity)
export class PublisherRepository extends Repository<PublisherEntity> {
    findAll() {
        return this.find({
            order: {
                created_at: "DESC"
            }
        });
    }

    // find or persist publisher
    async checkByName(name: string): Promise<PublisherEntity> {

        let publisher = await this.findOne({
            where: {
                name: ILike(name.trim())
            }
        });

        if (publisher == null) {
            publisher = await this.save(this.create({ name: name.trim() }));
        }

        return publisher;
    }
}