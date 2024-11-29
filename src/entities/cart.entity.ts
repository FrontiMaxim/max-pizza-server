import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Variant } from './variant.entity';
import { Ingredient } from './ingredient.entity';
import { Order } from './order.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Variant)
  @JoinTable({
    name: 'cart_variant',
    joinColumn: { name: 'cart_id' },
    inverseJoinColumn: { name: 'variant_id' },
  })
  variants: Variant[];

  @ManyToMany(() => Ingredient)
  @JoinTable({
    name: 'cart_ingredient',
    joinColumn: { name: 'cart_id' },
    inverseJoinColumn: { name: 'ingredient_id' },
  })
  ingredients: Ingredient[];

  @OneToMany(() => Order, (order) => order.id)
  orders: Order[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
