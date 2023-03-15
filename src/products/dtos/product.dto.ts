import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray } from 'class-validator';
import { EntitlementDto } from '../../entitlements/dtos'

export class ProductDto {
  @ApiProperty({
    description: 'Product ID',
  })
  @Expose()
  id: number

  @ApiProperty({
    description: 'Product name',
    example: 'product0',
  })
  @Expose()
  name: string

  @ApiProperty({
    description: 'Product is public'
  })
  @Expose()
  public: boolean

  @ApiProperty({
    description: 'Product creation date'
  })
  @Expose({ name: 'createdAt' })
  @Transform(({ value }) => value.toISOString())
  created_at: string

  @ApiProperty({
    description: 'Product update date'
  })
  @Expose({ name: 'updatedAt' })
  @Transform(({ value }) => value.toISOString())
  updated_at: string

  @ApiProperty({
    description: 'Product external offerings'
  })
  @IsArray()
  @Expose({ name: 'externalOfferings' })
  external_offerings: number[]

  @ApiProperty({
    description: 'Product entitlements Ids'
  })
  @IsArray()
  @Expose({ name: 'entitlementIds'})
  entitlement_ids: number[]

  @ApiProperty({
    description: 'Product region Ids'
  })
  @IsArray()
  @Expose({ name: 'regionIds'})
  region_ids: number[]

  @ApiProperty({
    description: 'Product excluded products list'
  })
  @IsArray()
  @Expose({ name: 'excludedProducts'})
  excluded_products: number[]

  @Expose({ name: 'deletedAt' })
  @Transform(({ value }) => value !== null ? value.toISOString() : value)
  deleted_at: string

  @Expose()
  @Type(() => EntitlementDto)
  entitlements: EntitlementDto[]
}
