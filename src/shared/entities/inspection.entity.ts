import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { BrakeFluidSightGlass } from '../types/brake-fluid-sight-glass.enum';
import { CustomerType } from '../types/customer-type.enum';
import { FuelType } from '../types/fuel-type.enum';
import { RevisionType } from '../types/revision-type.enum';
import { ServiceType } from '../types/service-type.enum';
import { TernaryChoice } from '../types/ternary-choice.enum';
import { TirePosition } from '../types/tire-position.enum';
import { VehicleType } from '../types/vehicle-type.enum';

export class Checklist {
  @Column()
  is_clean: boolean;

  @Column({ nullable: true })
  hubcaps_removed?: boolean;

  @Column({ nullable: true })
  alarms_off?: boolean;

  @Column({ nullable: true })
  is_unloaded?: boolean;

  @Column({ nullable: true })
  public_service_seats?: number;

  @Column({ nullable: true })
  seatbelts_visible?: boolean;
}

export class Axle {
  @Column()
  index: number;

  @Column()
  axle_type: string;
}

export class Tire {
  @Column()
  position: TirePosition;

  @Column()
  code: string;

  @Column()
  tire_pressure: number;
}

@Entity('inspections')
export class Inspection {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  inspection_number: string;

  @Column()
  mileage: number;

  @Column()
  date: Date;

  @Column()
  inspection_date: Date;

  @Column()
  client_id: string;

  @Column()
  vehicle_id: string;

  @Column({ nullable: true })
  vehicle_type?: VehicleType;

  @Column({ nullable: true })
  fuel_type?: FuelType;

  @Column({ nullable: true })
  fuel_certificate_number?: string;

  @Column({ nullable: true })
  service_type?: ServiceType;

  @Column()
  operator_id: string;

  @Column()
  responsible_id: string;

  @Column()
  customer_id: string;

  @Column()
  customer_type: CustomerType;

  @Column()
  revision_type: RevisionType;

  @Column()
  tinted_windows: TernaryChoice;

  @Column()
  armored_vehicle: TernaryChoice;

  @Column()
  brake_fluid_sight_glass: BrakeFluidSightGlass;

  @Column()
  observations: string;

  @Column()
  signature_url: string;

  @Column()
  photo_reception_url: string;

  @Column({ nullable: true })
  checklistId?: string;

  @Column(() => Checklist)
  checklist: Checklist;

  @Column()
  axles: Axle[];

  @Column()
  tires: Tire[];

  @Column({ nullable: true })
  deletedAt?: Date | null;
}
