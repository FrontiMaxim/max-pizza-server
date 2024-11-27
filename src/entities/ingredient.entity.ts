import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from './product.entity';
import { Cart } from './cart.entity';

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @CreateDateColumn({ type: 'date', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'date', name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'ingredient_product',
    joinColumn: { name: 'ingredient_id' },
    inverseJoinColumn: { name: 'product_id' },
  })
  product: Product[];

  @ManyToMany(() => Cart)
  carts: Cart[];
}
