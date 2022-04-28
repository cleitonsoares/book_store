import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InventoryTypeEnum } from "../../api/enums/InventoryTypeEnum";
import { BookEntity } from "./BookEntity";

@Entity({ name: "book_inventories" })
export class BookInventoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BookEntity, bookEntity => bookEntity.id, {
    nullable: false,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: 'book_id', referencedColumnName: "id" })
  book: BookEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'int4', nullable: false })
  quantity: number;

  @Column({
    type: "enum",
    enum: InventoryTypeEnum,
    default: InventoryTypeEnum.IN
  })
  in_out: InventoryTypeEnum
}