import { EntityRepository, Repository } from "typeorm";
import { BookAuthorEntity } from "../entities/BookAuthorEntity";

@EntityRepository(BookAuthorEntity)
export class BookAuthorRepository extends Repository<BookAuthorEntity> {
    findAll() {
        return this.find({
            order: {
                created_at: "DESC"
            }
        });
    }
}