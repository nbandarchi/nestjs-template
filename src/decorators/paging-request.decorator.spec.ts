import { PagingRequestFactory } from './paging-request.decorator'
import { Paging } from '../common/paging'
import { mockRequestContext } from '../interceptors/interceptor-mocks'

describe('@PagingRequest', () => {
  it('should return a Paging object with offset and limit', () => {
    const context = mockRequestContext({ query: { offset: 10, limit: 50 }})
    expect(PagingRequestFactory(null, context)).toEqual(new Paging(10, 50))
  })

  it('should return a default Paging object if not included in the query string', () => {
    const context = mockRequestContext({ query: {}})
    const pagingRequest = new Paging()
    expect(pagingRequest.offset).toEqual(0)
    expect(pagingRequest.limit).toEqual(50)
    expect(PagingRequestFactory(null, context)).toEqual(pagingRequest)
  })

  it('should reduce Limit to a max of 50 by default', () => {
    const context = mockRequestContext({ query: { limit: 51 }})
    expect(PagingRequestFactory(null, context)).toEqual(new Paging(0, 50))
  })

  it('should allow Limit to be overriden', () => {
    const context = mockRequestContext({ query: { limit: 101 }})
    expect(PagingRequestFactory({ limitOverride: 100}, context)).toEqual(new Paging(0, 100))
  })
})
