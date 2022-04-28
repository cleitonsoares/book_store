import { EntityRepository, Repository } from "typeorm";
import { AuthorEntity } from "../entities/AuthorEntity";
import { BookEntity } from "../entities/BookEntity";

@EntityRepository(BookEntity)
export class BookRepository extends Repository<BookEntity> {
    findAll() {
        return this.find({
            order: {
                created_at: "DESC"
            },
            relations: ["bookAuthors", "publisher"]
        });
    }

    async search(searchTerm: string): Promise<BookEntity[]> {

        return await this.createQueryBuilder("books")
            .innerJoinAndSelect('books.bookAuthors', 'bookAuthors')
            .innerJoinAndSelect('bookAuthors.author', 'author')
            .innerJoinAndSelect('books.publisher', 'publisher')
            .where(
                "author.name ilike :q OR publisher.name ilike :q OR books.name ilike :q",
                { q: `%${searchTerm}%` }
            )
            .getMany();
    }

    async checkByNameAuthor(name: string, author: AuthorEntity) {
        return await this.createQueryBuilder("books")
            .innerJoinAndSelect('books.bookAuthors', 'bookAuthors')
            .innerJoinAndSelect('bookAuthors.author', 'author')
            .where(
                "(author.name = :authorName OR author.id = :authorId) AND books.name = :bookName",
                {
                    authorName: author.name,
                    authorId: author.id,
                    bookName: name.trim()
                }
            )
            .getMany();
    }
}