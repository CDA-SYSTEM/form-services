import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('template_variables')
export class TemplateVariable {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string; // e.g., 'Nombre del Cliente'

  @Column()
  tag: string; // e.g., 'client.name'

  @Column()
  description: string;

  @Column()
  category: string; // e.g., 'CLIENT', 'INVOICE', 'VEHICLE'

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
