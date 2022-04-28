import { EntityRepository, Repository } from "typeorm";
import { BookEntity } from "../entities/BookEntity";
import { BookInventoryEntity } from "../entities/BookInventoryEntity";

@EntityRepository(BookInventoryEntity)
export class BookInventoryRepository extends Repository<BookInventoryEntity> {
    findAll() {
        return this.find({
            order: {
                created_at: "DESC"
            }
        });
    }

    async getBookCurrentInventory(book: BookEntity) {


        // console.log(this.createQueryBuilder('book_inventories')
        //     .select(`SUM(CASE
        //         WHEN book_inventories.in_out == 'OUT' book_inventories.quantity * -1
        //         ELSE book_inventories.quantity
        //     END)`, "current_inventory")
        //     .where("book_inventories.book_id = :id",
        //         { id: book.id }).getQuery())

        return await this.createQueryBuilder('book_inventories')
            .select(`SUM(CASE "book_inventories"."in_out"
                WHEN 'OUT'::book_inventories_in_out_enum THEN  "book_inventories"."quantity" * -1
                ELSE "book_inventories"."quantity"
            END)`, "current_inventory")
            .where("book_inventories.book_id = :id",
                { id: book.id })
            .getRawMany();
    }
}