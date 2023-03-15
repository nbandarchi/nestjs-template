import { Expose } from 'class-transformer'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, 
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Check
} from 'typeorm'

@Entity({ name: 'entitlements' })
export class Entitlement {
  @PrimaryGeneratedColumn(
    'identity', 
    { name: 'id', generatedIdentity: 'BY DEFAULT' }
  )
  id: number

  @Column('varchar')
  name: string

  @Column('int', { array: true, default: [] })
  @Expose({ name: 'resource_ids'})
  @Check('resources_exist', `array_fk_exists(resource_ids, 'resources')`)
  resourceIds: number[]

  @Column('int')
  @Expose({ name: 'service_period_days'})
  servicePeriodDays: number

  @Column('int')
  @Expose({ name: 'quantity_per_period'})
  quantityPerPeriod: number

  @Column('int', { array: true, default: [] })
  @Expose({ name: 'insurance_enabled_for'})
  insuranceEnabledFor: number[]

  @Column('int', { array: true, default: [] })
  @Expose({ name: 'region_ids'})
  regionIds: number[]

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'created_at'})
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'updated_at'})
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'deleted_at'})
  deletedAt?: Date
}
