import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { config } from '../config'
import { Paging } from '../common/paging'

type PagingOptions = {
  limitOverride?: number
}

export const PagingRequestFactory = (options: PagingOptions = {}, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest()
  const maxLimit = options?.limitOverride || config.paging.maxLimit
  if (request.query.limit !== undefined && request.query.limit > 0) {
    request.query.limit = Math.min(request.query.limit, maxLimit)
  }
  return new Paging(request.query.offset, request.query.limit)
}

export const PagingRequest = createParamDecorator(PagingRequestFactory)

