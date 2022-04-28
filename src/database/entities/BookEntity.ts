import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BookFormatEnum } from "../../api/enums/BookFormatEnum";
import { BookAuthorEntity } from "./BookAuthorEntity";
import { PublisherEntity } from "./PublisherEntity";

@Entity({ name: "books" })
export class BookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: 'timestamptz' })
  published_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => BookAuthorEntity, bookAuthorEntity => bookAuthorEntity.book)
  bookAuthors: BookAuthorEntity[];

  @ManyToOne(() => PublisherEntity, publisherEntity => publisherEntity.id, { nullable: false })
  @JoinColumn({ name: 'publisher_id', referencedColumnName: "id" })
  publisher: PublisherEntity;

  @Column({
    type: "enum",
    enum: BookFormatEnum,
    default: BookFormatEnum.PHYSICAL
  })
  format: BookFormatEnum
}