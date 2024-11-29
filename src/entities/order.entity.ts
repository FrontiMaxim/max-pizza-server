import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

export enum OrderStatus {
  PENDING,
  SUCCEEDED,
  CANCELLED,
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @ManyToOne(() => Cart, (cart) => cart.id)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
