import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  color?: string;

  @Column()
  order: number;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  deletedAt?: Date | null;
}
