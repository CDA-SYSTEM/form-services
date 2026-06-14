import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('template_types')
export class TemplateType {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  code: string; // e.g., 'INVOICE'

  @Column()
  name: string; // e.g., 'Factura de Venta'

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
