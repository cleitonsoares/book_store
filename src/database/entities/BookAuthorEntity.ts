import { CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AuthorEntity } from "./AuthorEntity";
import { BookEntity } from "./BookEntity";

@Entity({ name: "book_authors" })
export class BookAuthorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BookEntity, book => book.bookAuthors, {
    nullable: false,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: 'book_id', referencedColumnName: 'id' })
  book: BookEntity;

  @ManyToOne(() => AuthorEntity, author => author.authors, { nullable: false })
  @JoinColumn({ name: 'author_id', referencedColumnName: 'id' })
  author: AuthorEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}