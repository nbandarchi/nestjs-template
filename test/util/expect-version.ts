import { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'

const { NOT_FOUND } = StatusCodes

type Method = 'GET' | 'PUT' | 'POST' | 'DELETE'

export async function expectVersion(request: SuperTest<Test>, routePrefix: string, route: VersionedRoute) {
  const url = routePrefix + route.url
  const notFound = await request[route.method.toLowerCase()](url)
  const versioned = await request[route.method.toLowerCase()](url).set('Version', route.version)

  expect(notFound.status).toEqual(NOT_FOUND)
  expect(notFound.body?.message).toEqual(`Cannot ${route.method} ${url}`)
  if (versioned.status === NOT_FOUND) {
    expect(versioned.body.message).not.toEqual(`Cannot ${route.method} ${url}`)
  }
}

export class VersionedRoute {
  constructor(
    public method: Method,
    public url: string,
    public version: string,
  ) {}
}
