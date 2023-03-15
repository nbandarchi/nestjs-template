import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ClassConstructor } from 'class-transformer'
import { isArray } from 'class-validator'

export function LastModified() {
  return UseInterceptors(new LastModifiedInterceptor())
}
export class LastModifiedInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        const items = []
        if (data && isArray(data) && isArray(data[0]) && data[0].length > 0) {
          items.push(...data[0])
        } else {
          items.push(data)
        }
        // Allow this to work before or after serialize interceptor
        const dateKey = items[0]['updated_at'] ? 'updated_at' : 'updatedAt'
        const getMaxDate = (items: ClassConstructor<any>[]): Date => {
          let maxDate: Date
          items.forEach(item => {
            for (let key of Object.keys(item)) {
              if (key === dateKey && (!maxDate || item[key] > maxDate)) {
                maxDate = item[dateKey]
              } else if (isArray(item[key]) && item[key].length > 0 && item[key][0][dateKey] !== undefined) {
                const childMaxDate = getMaxDate(item[key])
                if (!maxDate || childMaxDate > maxDate) {
                  maxDate = childMaxDate
                }
              }
            }
          })
          return maxDate
        }
        const maxDate = getMaxDate(items)
        if (maxDate) {
          const res = context.switchToHttp().getResponse()
          res.header('Last-Modified', formatDate(maxDate))
        }
        return data
      })
    )
  }
}

function formatDate(date: Date): string {
  const utc0 = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
  const dayShort = utc0.toLocaleString('en-us', {weekday: 'short'})
  const dayNumber = utc0.getUTCDate()
  const monthYear = utc0.toLocaleString('en-us',{month:'short', year:'numeric'})
  const hour24 = utc0.toLocaleTimeString('en-GB')

  return`${dayShort}, ${dayNumber} ${monthYear} ${hour24} GMT`
}
