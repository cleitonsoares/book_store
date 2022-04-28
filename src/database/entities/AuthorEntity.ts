import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BookAuthorEntity } from "./BookAuthorEntity";

@Entity({ name: "authors" })
export class AuthorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => BookAuthorEntity, bookAuthorEntity => bookAuthorEntity.book)
  authors: BookAuthorEntity[];
}