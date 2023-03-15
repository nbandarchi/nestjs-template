import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsBoolean } from 'class-validator'

class ChangeResourceDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'resource0'
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'Is Resource billable',
    example: true
  })
  @IsBoolean()
  billable: boolean

  @ApiProperty({
    name: 'accepts_insurance',
    description: 'Can Resource be used with insurance',
    example: true
  })
  @IsBoolean()
  @Expose({ name: 'accepts_insurance' })
  acceptsInsurance: boolean
}

export class CreateResourceDto extends ChangeResourceDto {}
export class UpdateResourceDto extends ChangeResourceDto {}