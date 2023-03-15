// This code pulled from https://stackoverflow.com/questions/69393098/how-to-test-nestjs-response-interceptor?noredirect=1
import { of } from 'rxjs'

// Creates a fake context that will include a fake http request
export function mockRequestContext(httpRequest: any = {}): any {
  return {
    switchToHttp: () => ({
      getRequest: jest.fn().mockReturnValue(httpRequest)
    })
  }
}

// Creates a fake context that will include a fake http response
export function mockResponseContext(httpResponse: any = {}): any {
  return {
    switchToHttp: () => ({
      getResponse: jest.fn().mockReturnValue(httpResponse)
    })
  }
}

// Creates a handler that forward return value from controller
export function mockHandler(data: any) {
  return {
    handle: () => of(data)
  }
}

// Creates an observable to validate the final modified result
export function expectObservable(data: any) {
  return {
    next: (val) => expect(val).toEqual(data),
    complete: jest.fn()
  }
}

export function expectObservableError(expected: Error) {
  return {
    next: jest.fn(),
    error: (error) => expect(error).toEqual(expected),
    complete: jest.fn()
  }
}