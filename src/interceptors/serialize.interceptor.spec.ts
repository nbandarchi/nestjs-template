import { SerializeInterceptor } from './serialize.interceptor'
import { Expose } from 'class-transformer' 
import { mockRequestContext, mockHandler, expectObservable, expectObservableError } from './interceptor-mocks'
import { config } from '../config'

class TestEntity {
  constructor(
    public safeField: string,
    public sensitiveField: string
  ) {}
}

class TestDto {
  constructor(safeField: string) {
    this.safeField = safeField
  }

  @Expose()
  public safeField: string
}

describe('SerializeInterceptor', () => {
  const test = new SerializeInterceptor(TestDto)

  it('should return a formatted Dto when returning an Entity', async () => {
    const observable = await test.intercept(
      mockRequestContext(), 
      mockHandler(new TestEntity('safe', 'sensitive')) 
    )
    observable.subscribe(expectObservable(new TestDto('safe')))
    expect.assertions(1)
  })

  it('should return undefined and not throw an error if no data is provided', async () => {
    const observable = await test.intercept(
      mockRequestContext(), 
      mockHandler(undefined) 
    )
    observable.subscribe(expectObservable(undefined))
    expect.assertions(1)
  })

  it('should return a PagedDto when returning [Entity[], Number]', async () => {
    const value = [
      [ new TestEntity('safe', 'sensitive'), new TestEntity('safe', 'sensitive') ],
      2
    ]
    const expected = {
      items: [ new TestDto('safe'), new TestDto('safe') ],
      paging: {
        offset: 0,
        limit: 10,
        totalCount: 2
      }
    }

    const observable = await test.intercept(
      mockRequestContext({ query: { limit: 10, offset: 0 }}), 
      mockHandler(value) 
    )
    observable.subscribe(expectObservable(expected))
    expect.assertions(1)
  })

  it('should throw an Error if value is Array with unexpected format', async () => {
    const sampleArrays = [
      [],
      [1, []],
      [1, 2, 3]
    ]

    for(let array of sampleArrays) {
        const observable = await test.intercept(
          mockRequestContext(), 
          mockHandler(array) 
        )
        observable.subscribe(expectObservableError(new Error('unexpected array format')))
    }
    expect.assertions(3)
  })
})
