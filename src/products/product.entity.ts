import { Expose } from 'class-transformer'
import { Entitlement } from '../entitlements/entitlement.entity'
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity, Check, DeleteDateColumn } from 'typeorm'

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  id: number

  @Column('varchar')
  name: string

  @Column('bool')
  public: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'created_at'})
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'updated_at'})
  updatedAt: Date

  @Column('int', { array: true, default: [] })
  @Expose({ name: 'external_offerings'})
  externalOfferings: number[]

  @Column('int', { array: true, default: []  })
  @Expose({ name: 'entitlement_ids'})
  @Check('entitlements_exist', `array_fk_exists(entitlement_ids, 'entitlements')`)
  entitlementIds: number[]

  @Column('int', { array: true, default: []  })
  @Expose({ name: 'region_ids'})
  regionIds: number[]

  @Column('int', { array: true, default: []  })
  @Expose({ name: 'excluded_products'})
  excludedProducts: number[]

  @DeleteDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'deleted_at'})
  deletedAt?: Date
}

export class ProductEntitlements extends Product {
  entitlements: Entitlement[]
}
