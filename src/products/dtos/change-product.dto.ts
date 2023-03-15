import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsArray, IsNumber, IsBoolean } from 'class-validator'

class ChangeProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'value',
  })  
  @IsString()
  name: string

  @ApiProperty({
    description: 'Product is public',
    example: true
  })
  @IsBoolean()
  public: boolean

  @ApiProperty({
    name: 'external_offerings',
    description: 'Product external offerings',
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'external_offerings' })
  externalOfferings: number[]

  @ApiProperty({
    name: 'entitlement_ids',
    description: 'Product entitlements Ids',
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'entitlement_ids'})
  entitlementIds: number[]

  @ApiProperty({
    name: 'region_ids',
    description: 'Product region Ids',
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'region_ids'})
  regionIds: number[]

  @ApiProperty({
    name: 'excluded_products',
    description: 'Product excluded products list',
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Expose({ name: 'excluded_products'})
  excludedProducts: number[]
}

export class CreateProductDto extends ChangeProductDto {}
export class UpdateProductDto extends ChangeProductDto {}
