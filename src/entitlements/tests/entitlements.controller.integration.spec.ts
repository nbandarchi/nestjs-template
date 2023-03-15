import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import snakecaseKeys from 'snakecase-keys'
import { AppModule } from '../../app/app.module'
import { TestUtil } from '../../testing/util'
import { EntitlementsFixture, ResourcesFixture } from '../../testing/fixtures'
import { Entitlement } from '../entitlement.entity'
import { Resource } from '../../resources/resource.entity'

describe('EntitlementsService', () => {
  const entitlementsFixture = new EntitlementsFixture()
  const { testEntitlement, testEntitlement2 } = entitlementsFixture.data
  const { OK, CREATED, NOT_FOUND, BAD_REQUEST, NO_CONTENT } = StatusCodes
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await app.close()
  })

  describe('GET /products/entitlements', () => {
    it('should return OK and a collection of entitlements', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/entitlements')
        .expect(OK)

      expect(response.body).toEqual(entitlementsFixture.expectPagedDto([testEntitlement]))
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(1)
    })

    it('should return OK and a collection of paged entitlements', async () => {
      const response = await request(app.getHttpServer())
      .get('/products/entitlements?offset=1&limit=1')
      .expect(OK)

      expect(response.body).toEqual({
        items: [testEntitlement2.toDto()],
        paging: {
            offset: 1,
            limit: 1,
            totalCount: expect.any(Number),
        }
      })
    })
  })

  describe('GET /products/entitlements/:id', () => {
    it('should return OK and an entitlement', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/entitlements/${testEntitlement.id}`)
        .expect(OK)

      expect(response.body).toEqual({ ...testEntitlement.toDto(), created_at: expect.anything() })
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      await request(app.getHttpServer())
        .get('/products/entitlements/-1')
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/products/entitlements/unknown')
        .expect(BAD_REQUEST)
    })
  })

  describe('GET /products/entitlements/:id/resources', () => {
    const resourcesFixture = new ResourcesFixture()

    it('should return OK and a collection of resources', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/entitlements/${testEntitlement.id}/resources`)
        .expect(OK)

      expect(response.body).toEqual(resourcesFixture.expectPagedDto([resourcesFixture.data.testResource]))
      expect(response.body.paging.totalCount).toEqual(1)
    })

    it('should return OK and an empty collection if entitlement exists with no resources', async () => {
      await request(app.getHttpServer())
        .get(`/products/entitlements/${testEntitlement.id}/resources`)
        .expect(OK)
      await TestUtil.deleteByIds(['1'], Resource)

      const response = await request(app.getHttpServer())
        .get(`/products/entitlements/${testEntitlement.id}/resources`)
        .expect(OK)

      expect(response.body).toEqual(resourcesFixture.expectPagedDto([]))
      expect(response.body.paging.totalCount).toEqual(0)
    })

    it('should return OK and an empty collection if entitlement does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/entitlements/-1/resources')
        .expect(OK)

      expect(response.body).toEqual(resourcesFixture.expectPagedDto([]))
      expect(response.body.paging.totalCount).toEqual(0)
    })
  })

  describe('POST /products/entitlements', () => {
    const { createEntitlementDto } = entitlementsFixture.requestDtos
    let entitlementIds: string[] = []

    afterEach(async () => {
      if (entitlementIds.length > 0) {
        await TestUtil.deleteByIds(entitlementIds, Entitlement)
        entitlementIds = []
      }
    })

    it('should return CREATED and a created entitlement', async () => {
      const body = snakecaseKeys(createEntitlementDto, { deep: true })
      const response = await request(app.getHttpServer())
        .post('/products/entitlements')
        .send(body)

      entitlementIds.push(response.body.id)
      expect(response.status).toEqual(CREATED)
      expect(response.body).toEqual(entitlementsFixture.data.createdEntitlement.toDto())
    })

    it('should return BAD_REQUEST if extra fields are included in the request', async () => {
      const extraFields = { ...createEntitlementDto, id: 10, extraField: true }
      const body = snakecaseKeys(extraFields, { deep: true })
      await request(app.getHttpServer())
        .post('/products/entitlements')
        .send(body)
        .expect(BAD_REQUEST)
    })

    it.each(Object.keys(createEntitlementDto))('should return BAD_REQUEST if %s parameter is null', async (key) => {
      const missingFields = { ...createEntitlementDto }
      delete missingFields[key]
      const body = snakecaseKeys(missingFields, { deep: true })
      await request(app.getHttpServer())
        .post('/products/entitlements')
        .send(body)
        .expect(BAD_REQUEST)
    })
  })

  describe('PUT /products/entitlements/:id', () => {
    const { updateEntitlementDto } = entitlementsFixture.requestDtos

    it('should return OK and an updated entitlement', async () => {
      const body = snakecaseKeys(updateEntitlementDto, { deep: true })
      const response = await request(app.getHttpServer())
        .put(`/products/entitlements/${testEntitlement.id}`)
        .send(body)
        .expect(OK)

      expect(response.body).toEqual(entitlementsFixture.data.updatedEntitlement.toDto())
    })

    it('should return BAD_REQUEST if extra fields are included in the request', async () => {
      const extraFields = { ...updateEntitlementDto, id: 10, extraField: true }
      const body = snakecaseKeys(extraFields, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/entitlements/${testEntitlement.id}`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it.each(Object.keys(updateEntitlementDto))('should return BAD_REQUEST if %s parameter is null', async (key) => {
      const missingFields = { ...updateEntitlementDto }
      delete missingFields[key]
      const body = snakecaseKeys(missingFields, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/entitlements/${testEntitlement.id}`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      const body = snakecaseKeys(updateEntitlementDto, { deep: true })
      await request(app.getHttpServer())
        .put('/products/entitlements/-1')
        .send(body)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .put('/products/entitlements/unknown')
        .expect(BAD_REQUEST)
    })
  })

  describe('DELETE /products/entitlements/:id', () => {
    it('should return NO_CONTENT and an empty body', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/entitlements/${testEntitlement.id}`)
        .expect(NO_CONTENT)

      expect(response.body).toEqual({})
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/products/entitlements/-1`)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .delete(`/products/entitlements/unknown`)
        .expect(BAD_REQUEST)
    })
  })
})
