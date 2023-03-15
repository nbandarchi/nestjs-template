import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'

export class ResourceDto {
  @ApiProperty({
    description: 'Resource ID',
  })
  @Expose()
  id: number

  @ApiProperty({
    description: 'Resource name',
    example: 'resource0'
  })
  @Expose()
  name: string

  @ApiProperty({
    description: 'Is Resource billable',
    example: true
  })
  @Expose()
  billable: boolean

  @ApiProperty({
    description: 'Can Resource be used with insurance',
    example: true
  })
  @Expose({ name: 'acceptsInsurance' })
  accepts_insurance: boolean

  @ApiProperty({
    description: 'Resource creation date'
  })
  @Expose({ name: 'createdAt' })
  @Transform(({ value }) => value.toISOString())
  created_at: string

  @ApiProperty({
    description: 'Resource update date'
  })
  @Expose({ name: 'updatedAt' })
  @Transform(({ value }) => value.toISOString())
  updated_at: string

  @ApiProperty({
    description: 'Resource deletion date'
  })
  @Expose({ name: 'deletedAt' })
  @Transform(({ value }) => value !== null ? value.toISOString() : value)
  deleted_at: string
}