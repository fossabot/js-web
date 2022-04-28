import { Entity, Column, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { ProductSKURaw } from './ProductSKURaw.entity';
import { ProductItemRaw } from './ProductItemRaw.entity';

@Entity()
@Unique('product_sku_line_raw_unique', ['skuId', 'productItemId'])
export class ProductSKULineRaw extends Base {
  @Column({ nullable: false })
  private skuId!: string;

  @Column({ nullable: false })
  private productItemId!: string;

  @ManyToOne(() => ProductSKURaw, {
    nullable: false,
    eager: true,
  })
  sku: ProductSKURaw;

  @ManyToOne(() => ProductItemRaw, {
    nullable: false,
    eager: true,
  })
  productItem: ProductItemRaw;

  @Column({ nullable: false, default: 'Active' })
  status: string;
}
