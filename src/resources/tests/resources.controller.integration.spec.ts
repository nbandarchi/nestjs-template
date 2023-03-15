import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../app/app.module'
import { ResourcesFixture } from '../../testing/fixtures'
import { TestUtil } from '../../testing/util'
import { StatusCodes } from 'http-status-codes'
import snakeCaseKeys from 'snakecase-keys'
import { Resource } from '../resource.entity'

describe('Resource Controller', () => {
  const resourcesFixture = new ResourcesFixture()
  const { testResource, testResource2 } = resourcesFixture.data
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

  describe('GET /products/resources', () => {
    it('should return OK and a collection of Resources', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/resources')
        .expect(OK)

      expect(response.body).toEqual(resourcesFixture.expectPagedDto([testResource]))
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(1)
    })

    it('should return OK and a paged collection of Resources', async () => {
      const response = await request(app.getHttpServer())
      .get('/products/resources?offset=1&limit=1')
      .expect(OK)

      expect(response.body).toEqual({
        items: [testResource2.toDto()],
        paging: {
            offset: 1,
            limit: 1,
            totalCount: expect.any(Number),
        }
      })
    })
  })

  describe('GET /products/resources/:id', () => {
    it('should return OK and a resource', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/resources/${testResource.id}`)
        .expect(OK)

      expect(response.body).toEqual({ ...testResource.toDto(), created_at: expect.anything() })
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/products/resources/-1`)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .get(`/products/resources/unknown`)
        .expect(BAD_REQUEST)
    })
  })

  describe('PUT /products/resources/:id', () => {
    const { updateResourceDto } = resourcesFixture.requestDtos

    it('should return OK and an updated Resource', async () => {
      const body = snakeCaseKeys(updateResourceDto, { deep: true })
      const response = await request(app.getHttpServer())
        .put(`/products/resources/${testResource.id}`)
        .send(body)
        .expect(OK)

      expect(response.body).toEqual(resourcesFixture.data.updatedResource.toDto())
    })

    it('should return  BAD_REQUEST if extra fields are included in the request', async () => {
      const extraFields = { ...updateResourceDto, id: 12, imAttackinYou: true }
      const body = snakeCaseKeys(extraFields, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/resources/${testResource.id}`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it.each(Object.keys(updateResourceDto))('should return BAD_REQUEST if %s parameter is null', async (key) => {
      const missingFields = { ...updateResourceDto }
      delete missingFields[key]
      const body = snakeCaseKeys(missingFields, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/resources/${testResource.id}`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      const body = snakeCaseKeys(updateResourceDto, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/resources/-1`)
        .send(body)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .put(`/products/resources/unknown`)
        .expect(BAD_REQUEST)
    })
  })

  describe('POST /products/resources', () => {
    const { createResourceDto } = resourcesFixture.requestDtos
    let resourceIds: string[] = []

    afterEach(async () => {
      if (resourceIds.length > 0) {
        await TestUtil.deleteByIds(resourceIds, Resource)
        resourceIds = []
      }
    })

    it('should return CREATED and a created Resource', async () => {
      const body = snakeCaseKeys(createResourceDto, { deep: true })
      const response = await request(app.getHttpServer())
        .post(`/products/resources`)
        .send(body)

      resourceIds.push(response.body.id)
      expect(response.status).toEqual(CREATED)
      expect(response.body).toEqual(resourcesFixture.data.createdResource.toDto())
    })

    it('should return BAD_REQUEST if extra fields are included in the request', async () => {
      const extraFields = { ...createResourceDto, id: 12, imAttackinYou: true }
      const body = snakeCaseKeys(extraFields, { deep: true })
      await request(app.getHttpServer())
        .post(`/products/resources`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it.each(Object.keys(createResourceDto))('should return BAD_REQUEST if %s parameter is null', async (key) => {
      const missingFields = { ...createResourceDto }
      delete missingFields[key]
      const body = snakeCaseKeys(missingFields, { deep: true })
      await request(app.getHttpServer())
        .post(`/products/resources`)
        .send(body)
        .expect(BAD_REQUEST)
    })
  })

  describe('DELETE /products/resources/:id', () => {
    it('should return NO_CONTENT and an empty body', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/resources/${testResource.id}`)
        .expect(NO_CONTENT)

      expect(response.body).toEqual({})
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/products/resources/-1`)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .delete(`/products/resources/unknown`)
        .expect(BAD_REQUEST)
    })
  })
})
