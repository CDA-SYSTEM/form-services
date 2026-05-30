import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

export class InvoiceClient {
  @Column()
  document: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;
}

export class InvoiceItem {
  @Column()
  concept: string;

  @Column()
  quantity: number;

  @Column()
  unitPrice: number;

  @Column()
  total: number;
}

@Entity('invoices')
export class Invoice {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  invoice_number: string;

  @Column(() => InvoiceClient)
  client: InvoiceClient;

  @Column()
  items: InvoiceItem[];

  @Column()
  subtotal: number;

  @Column()
  tax: number;

  @Column()
  total: number;

  @Column()
  statusId: string;

  @Column()
  inspection_id: string;

  @Column({ nullable: true })
  observations?: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date | null;
}
