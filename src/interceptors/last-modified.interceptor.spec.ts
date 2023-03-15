import { LastModifiedInterceptor } from './last-modified.interceptor'
import { mockResponseContext, mockHandler, expectObservable } from './interceptor-mocks'

describe('LastModifiedInterceptor', () => {
  const test = new LastModifiedInterceptor()
  const header = jest.fn()
  const earlierDate = new Date('2022-01-01T00:00:00.000Z')
  const latestDate = new Date('2022-02-01T02:30:00.000Z')
  const expectedHeader = ['Last-Modified', 'Tue, 1 Feb 2022 02:30:00 GMT']

  it('should set the Last-Modified header for a single item', async () => {
    const data = { 
      updated_at: earlierDate,
      children: [{ updated_at: latestDate }]
    }
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler(data) 
    )
    observable.subscribe(expectObservable(data))
    expect(header).toHaveBeenCalledWith(...expectedHeader)
  })

  it('should set the Last-Modified header for a single flat item', async () => {
    const data = { updated_at: latestDate }
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler(data) 
    )
    observable.subscribe(expectObservable(data))
    expect(header).toHaveBeenCalledWith(...expectedHeader)
  })

  it('should set the Last-Modified header for a collection', async () => {
    const data = [[{
      updated_at: earlierDate,
      children: [{ updated_at: latestDate }]
    }]]
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler(data) 
    )
    observable.subscribe(expectObservable(data))
    expect(header).toHaveBeenCalledWith(...expectedHeader)
  })

  it('should set the Last-Modified header for a deeply nested collection', async () => {
    const data = [[{
      updated_at: earlierDate,
      children: [{ 
        updated_at: earlierDate,
        childrenest: [{
          updated_at: latestDate
        }]
      }]
    }]]
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler(data) 
    )
    observable.subscribe(expectObservable(data))
    expect(header).toHaveBeenCalledWith(...expectedHeader)
  })

  it('should set the Last-Modified if data is camelCase', async () => {
    const data = { updated_at: latestDate }
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler(data) 
    )
    observable.subscribe(expectObservable(data))
    expect(header).toHaveBeenCalledWith(...expectedHeader)
  })

  it('should not set the Last-Modified header for an empty singular response', async () => {
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler({}) 
    )
    observable.subscribe(expectObservable({}))
    expect(header).not.toHaveBeenCalled()
  })

  it('should not set the Last-Modified header for an empty array response', async () => {
    const observable = await test.intercept(
      mockResponseContext({ header }), 
      mockHandler([[], 0]) 
    )
    observable.subscribe(expectObservable([[], 0]))
    expect(header).not.toHaveBeenCalled()
  })
})
