import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { RevisionType } from '../types/revision-type.enum';
import { VehicleType } from '../types/vehicle-type.enum';

@Entity('prices')
export class Price {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  vehicleType: VehicleType;

  @Column()
  revisionType: RevisionType;

  @Column()
  amount: number;

  @Column({ nullable: true })
  description?: string;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  deletedAt?: Date | null;
}
