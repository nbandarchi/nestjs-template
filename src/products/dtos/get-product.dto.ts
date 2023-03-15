import { Expose } from 'class-transformer'
import { ArrayContains, FindOptionsWhere } from 'typeorm'
import { IGetDtoBase } from '../../common/getDtoBase'
import { Product } from '../product.entity'

type PlainGetProductDto = {
  id?: number
  withEntitlements?: boolean,
  region?: number
}

export class GetProductDto implements IGetDtoBase<Product> {
  @Expose()
  public id: number

  @Expose()
  public region: number

  @Expose()
  public withEntitlements: boolean
  
  constructor(obj?: PlainGetProductDto) {
    if (obj !== undefined) {
      Object.assign(this, obj)
    }
  }

  toWhere(): FindOptionsWhere<Product> {
      const result = {
        id: this.id,
        regionIds: this.region ? ArrayContains([this.region]) : undefined        
      }
      Object.keys(result).forEach(key => result[key] === undefined && delete result[key])
      return result
  }
}