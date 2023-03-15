import { StatusCodes } from 'http-status-codes'
import request, { SuperTest, Test } from 'supertest'
import { expectVersion, VersionedRoute } from './util/expect-version'

import { NestFactory} from '@nestjs/core'
import { AppModule } from '../src/app/app.module'

describe('Main - App Setup', () => {
  const { OK } = StatusCodes
  const routePrefix = '/api/product-services'
  let server: SuperTest<Test>

  const versionedRoutes = {
    products: [
      new VersionedRoute('GET', '/products', '1'),
      new VersionedRoute('GET', '/products/-1', '1'),
      new VersionedRoute('PUT', '/products/-1', '1'),
      new VersionedRoute('POST', '/products', '1')
    ],
    resources: [
      new VersionedRoute('GET', '/products/resources/-1', '1'),
      new VersionedRoute('PUT', '/products/resources/-1', '1'),
      new VersionedRoute('POST', '/products/resources/', '1')
    ],
    entitlements: [
      new VersionedRoute('GET', '/products/entitlements', '1'),
      new VersionedRoute('GET', '/products/entitlements/-1', '1'),
      new VersionedRoute('PUT', '/products/entitlements/-1', '1'),
      new VersionedRoute('POST', '/products/entitlements', '1')
    ],
  }  

  beforeAll(async () => {
    server = request(process.env.SUPERTEST_URI || 'http://localhost:3000')
  })

  describe.each(Object.entries(versionedRoutes))(`Versioning for %s`, (_, routes) => {
    it.each(routes)(`should support v$version for $method ${routePrefix}$url`, async (route: VersionedRoute) => {
      await expectVersion(server, routePrefix, route)
    })
  })

  describe('Swagger', () => {
    it('should provide swagger documentation', async () => {
      const response = await server.get(`${routePrefix}/swagger`)
        .redirects(1)
        .expect(OK)

      expect(response.text).toContain('Swagger UI')
    })
  })

  // Proof of concept for "Audit" tests
  // Idea is to get a list of all routes and check that they all have swagger documentation/versioning
  // so that these manual steps aren't forgotten in a PR
  describe.skip('Getting Routes', () => {    
    it('should show me the routes', async () => {
      const app = await NestFactory.create(AppModule, { logger: false })
      await app.listen(3001)
      const server = app.getHttpServer()
      const router = server._events.request._router

        const existingRoutes: [] = router.stack
        .map(routeObj => {
          if (routeObj.route) {
            return {
              route: {
                path: routeObj.route?.path,
                method: routeObj.route?.stack[0].method,
              },
            }
          }
        })
        .filter(item => item !== undefined)
      console.log(existingRoutes)
      await app.close()
    })
  })
})
