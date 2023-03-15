import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { IGetDtoBase } from '../common/getDtoBase'
import { GetProductDto } from '../products/dtos'

type FromRequestOptions = {
  dto: ClassConstructor<IGetDtoBase<any>>
  whitelistFields?: string[],
  blacklistFields?: string []
}

export const FromRequestFactory = (data: ClassConstructor<IGetDtoBase<any>> | FromRequestOptions, context: ExecutionContext) => {
  const _data: FromRequestOptions = (<any>data).dto ? data as FromRequestOptions : { dto: data as ClassConstructor<IGetDtoBase<any>> }
  const request = context.switchToHttp().getRequest()
  const result = plainToInstance(_data.dto, { ...request.params, ...request.query}, {
    excludeExtraneousValues: true,
    exposeUnsetFields: false
  })
  if (_data.whitelistFields && _data.whitelistFields.length > 0) {
    for (let key of Object.keys(result)) {
      if (_data.whitelistFields.indexOf(key) === -1) {
        delete result[key]
      }
    }
  } else if (_data.blacklistFields && _data.blacklistFields.length > 0) {
    _data.blacklistFields.forEach(key => delete result[key])
  }
  return result
}

export const FromRequest = createParamDecorator(FromRequestFactory)