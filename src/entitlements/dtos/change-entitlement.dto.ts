import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsArray, IsNumber } from 'class-validator'

export class ChangeEntitlementDto {
  @ApiProperty({
    description: 'Entitlement name',
    example: 'Sample entitlement',
  })
  @IsString()
  name: string

  @ApiProperty({
    name: 'resource_ids',
    description: 'Resources for entitlement',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'resource_ids' })
  resourceIds: number[]

  @ApiProperty({
    name: 'service_period_days',
    description: 'Service period days',
    example: 30,
  })
  @IsNumber()
  @Expose({ name: 'service_period_days'})
  servicePeriodDays: number

  @ApiProperty({
    name: 'quantity_per_period',
    description: 'Quantity per period',
    example: 1,
  })
  @IsNumber()
  @Expose({ name: 'quantity_per_period'})
  quantityPerPeriod: number

  @ApiProperty({
    name: 'insurance_enabled_for',
    description: 'Insurance enabled for',
    example: [],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'insurance_enabled_for'})
  insuranceEnabledFor: number[]

  @ApiProperty({
    name: 'region_ids',
    description: 'Regions where entitlement is available',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'region_ids'})
  regionIds: number[]
}

export class CreateEntitlementDto extends ChangeEntitlementDto {}
export class UpdateEntitlementDto extends ChangeEntitlementDto {}
