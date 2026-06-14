import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('invoice_templates')
export class InvoiceTemplate {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  typeCode: string; // Foreign Key reference to TemplateType.code

  @Column()
  body: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
