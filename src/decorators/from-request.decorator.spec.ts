import { FromRequestFactory } from './from-request.decorator'
import { mockRequestContext } from '../interceptors/interceptor-mocks'
import { Expose } from 'class-transformer'

class TestGetDto {
  @Expose() id: number
  @Expose() queryValue: string
  @Expose() paramValue: string

  toWhere() {
    return {}
  }
}

describe('@FromRequest', () => {
  const testGetDto = new TestGetDto()

  beforeAll(() => {
    testGetDto.id = 1
    testGetDto.queryValue = 'A'
    testGetDto.paramValue = 'B'
  })

  it('should return a typed object with properties from request parameters and query ', () => {
    const context = mockRequestContext({ 
      query: { queryValue: testGetDto.queryValue }, 
      params: { id: testGetDto.id, paramValue: testGetDto.paramValue }
    })
    expect(FromRequestFactory(TestGetDto, context)).toEqual(testGetDto)
  })

  it('should allow whitelisting fields from the request', () => {
    const context = mockRequestContext({ 
      query: { queryValue: testGetDto.queryValue }, 
      params: { id: testGetDto.id, paramValue: testGetDto.paramValue }
    })
    const expected = {...testGetDto}
    delete expected.paramValue
    expect(FromRequestFactory({ dto: TestGetDto, whitelistFields: ['id', 'queryValue'] }, context)).toEqual(expected)
  })

  it('should allow blacklisting fields from the request', () => {
    const context = mockRequestContext({ 
      query: { queryValue: testGetDto.queryValue }, 
      params: { id: testGetDto.id, paramValue: testGetDto.paramValue }
    })
    const expected = {...testGetDto}
    delete expected.paramValue
    expect(FromRequestFactory({ dto: TestGetDto, blacklistFields: ['paramValue'] }, context)).toEqual(expected)
  })

  it('should return {} if query and params are empty', () => {
    const context = mockRequestContext({ query: {}, params: {}})
    expect(FromRequestFactory(TestGetDto, context)).toEqual({})
  })

  it('should return a partial object if valid parameters are undefined', () => {
    const partialDto = { ...testGetDto }
    delete partialDto.paramValue
    delete partialDto.queryValue
    const context = mockRequestContext({ 
      query: {}, 
      params: { id: testGetDto.id }
    })
    expect(FromRequestFactory(TestGetDto, context)).toEqual(partialDto)
  })

  it('should ignore invalid/extra paremeters', () => {
    const context = mockRequestContext({ 
      query: { queryValue: testGetDto.queryValue, extraQuery: 'extra' }, 
      params: { id: testGetDto.id, paramValue: testGetDto.paramValue, extraParam: 'extra' }
    })
    expect(FromRequestFactory(TestGetDto, context)).toEqual(testGetDto)
  })
})