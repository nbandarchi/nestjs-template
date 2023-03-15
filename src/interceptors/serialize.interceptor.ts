import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { plainToInstance } from 'class-transformer'
import { isArray, isInt } from 'class-validator'
import { config } from '../config'

interface ClassContructor {
  new(...args: any[]): {}
}

export function Serialize(dto: ClassContructor) {
  return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassContructor) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        const request = context.switchToHttp().getRequest()
        const response = {
          items: [],
          paging: {
            offset: Number(request?.query?.offset || 0),
            limit: Number(request?.query?.limit || config.paging.maxLimit),
            totalCount: 0
          }
        }
        if (isArray(data)) {
          // Expected format is [ Entities[], TotalCount ]
          if (data.length !== 2 || !isArray(data[0]) || !isInt(data[1])) {
            throw new Error('unexpected array format')
          }
          response.paging.totalCount = data[1]
          response.items = data[0].map(item => {
            return plainToInstance(this.dto, item, {
              excludeExtraneousValues: true
            })
          })
          return response
        } else {
          return plainToInstance(this.dto, data, {
            excludeExtraneousValues: true
          })
        }
      })
    )
  }
}
