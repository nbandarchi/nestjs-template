import { Expose } from 'class-transformer'
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity, DeleteDateColumn } from 'typeorm'

@Entity({ name: 'resources' })
export class Resource {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  id: number
  
  @Column('varchar')
  name: string

  @Column('bool')
  billable: boolean

  @Column('bool')
  @Expose({ name: 'accepts_insurance' })
  acceptsInsurance: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'deleted_at' })
  deletedAt?: Date
}