import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray } from 'class-validator';

export class EntitlementDto {
  @ApiProperty({
    description: 'Entitlement ID',
  })
  @Expose()
  id: number

  @ApiProperty({
    description: 'Entitlement name',
    example: 'Sample entitlement',
  })
  @Expose()
  name: string

  @ApiProperty({
    description: 'Resources for entitlement',
    example: [1, 2, 3],
  })
  @IsArray()
  @Expose({ name: 'resourceIds' })
  resource_ids: number[]

  @ApiProperty({
    description: 'Service period days',
    example: 30,
  })
  @Expose({ name: 'servicePeriodDays'})
  service_period_days: number

  @ApiProperty({
    description: 'Quantity per period',
    example: 1,
  })
  @Expose({ name: 'quantityPerPeriod'})
  quantity_per_period: number

  @ApiProperty({
    description: 'Insurance enabled for',
    example: [],
  })
  @IsArray()
  @Expose({ name: 'insuranceEnabledFor'})
  insurance_enabled_for: number[]

  @ApiProperty({
    description: 'Regions where entitlement is available',
    example: [1, 2, 3],
  })
  @IsArray()
  @Expose({ name: 'regionIds'})
  region_ids: number[]

  @ApiProperty({
    description: 'Entitlement update date'
  })
  @Expose({ name: 'createdAt' })
  @Transform(({ value }) => value.toISOString())
  created_at: string

  @ApiProperty({
    description: 'Entitlement update date'
  })
  @Expose({ name: 'updatedAt' })
  @Transform(({ value }) => value.toISOString())
  updated_at: string

  @ApiProperty({
    description: 'Entitlement deletion date'
  })
  @Expose({ name: 'deletedAt' })
  @Transform(({ value }) => value !== null ? value.toISOString() : value)
  deleted_at: string
}




