import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../app/app.module'
import { ProductsFixture, EntitlementsFixture } from '../../testing/fixtures'
import { TestUtil } from '../../testing/util'
import { StatusCodes } from 'http-status-codes'
import snakeCaseKeys from 'snakecase-keys'
import { Product } from '../../products/product.entity'
import { Entitlement } from '../../entitlements/entitlement.entity'

describe('Product Controller', () => {
  const productsFixture = new ProductsFixture()
  const entitlementsFixture = new EntitlementsFixture()
  const { testProduct, productWithRegion } = productsFixture.data
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

  describe('GET /products', () => {
    it('should return OK, a collection of Products and last-modified on Header', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(OK)

      expect(response.body).toEqual(productsFixture.expectPagedDto([testProduct]))
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(1)
      expect(response.headers['last-modified']).toBeDefined()
    })

    it('should return OK and a paged collection of Products', async () => {
      const response = await request(app.getHttpServer())
      .get('/products?offset=1&limit=1')
      .expect(OK)

      expect(response.body).toEqual({
        items: [productWithRegion.toDto()],
        paging: {
            offset: 1,
            limit: 1,
            totalCount: expect.any(Number),
        }
      })
    })

    it('should return OK and a collection of Products from Region 7', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?region=7')
        .expect(OK)

      expect(response.body).toEqual(productsFixture.expectPagedDto([productWithRegion]))
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(1)
    })

    it('should return OK and an empty collection if no products from region 2 exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?region=2')
        .expect(OK)

      expect(response.body).toEqual(productsFixture.expectPagedDto([]))
      expect(response.body.paging.totalCount).toBe(0)
      expect(response.headers['last-modified']).toBeUndefined()
    })

    it('should return OK and a collection of Products with Entitlements', async () => {
      const productEntitlement = testProduct.toDeepCopy().toDto()
      delete productEntitlement.entitlement_ids
      productEntitlement['entitlements'] = [entitlementsFixture.data.testEntitlement.toDeepCopy().toDto()]

      const response = await request(app.getHttpServer())
        .get('/products?withEntitlements=true')
        .expect(OK)
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(1)
      expect(response.body.items).toEqual(expect.arrayContaining([productEntitlement]))
    })

    it('should return OK and a paged collection of Products with Entitlements', async () => {
      const productWithRegionEntitlement = productWithRegion.toDeepCopy().toDto()
      delete productWithRegionEntitlement.entitlement_ids
      productWithRegionEntitlement['entitlements'] = [entitlementsFixture.data.testEntitlement.toDeepCopy().toDto()]

      const response = await request(app.getHttpServer())
        .get('/products?withEntitlements=true&offset=1&limit=1')
        .expect(OK)

      expect(response.body).toEqual({
        items: [productWithRegionEntitlement],
        paging: {
            offset: 1,
            limit: 1,
            totalCount: expect.any(Number),
        }
      })
    })
  })

  describe('GET /products/:id', () => {
    it('should return OK, a product and last-modified on Header', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProduct.id}`)
        .expect(OK)

      expect(response.body).toEqual({ ...testProduct.toDto(), created_at: expect.anything() })
      expect(response.headers['last-modified']).toBeDefined()
      expect(response.headers['last-modified']).toEqual('Wed, 8 Jun 2022 18:22:24 GMT')
    })

    it('should return OK and a product with Entitlements', async () => {
      const productEntitlement = testProduct.toDeepCopy().toDto()
      delete productEntitlement.entitlement_ids
      productEntitlement['entitlements'] = [entitlementsFixture.data.testEntitlement.toDeepCopy().toDto()]

      const response = await request(app.getHttpServer())
        .get(`/products/${testProduct.id}?withEntitlements=true`)
        .expect(OK)

      expect(response.body).toEqual({ ...productEntitlement, created_at: expect.anything() })
      expect(response.headers['last-modified']).toBeDefined()
      expect(response.headers['last-modified']).toEqual('Wed, 8 Jun 2022 18:22:24 GMT')
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/products/-1`)
        .expect(NOT_FOUND)
    })

    it('should return NOT_FOUND if id is not a number', async () => {
      await request(app.getHttpServer())
        .get(`/products/unknown`)
        .expect(NOT_FOUND)
    })
  })

  describe('GET /products/:id/entitlements', () => {
    const entitlementsFixture = new EntitlementsFixture()
    const { testEntitlement } = entitlementsFixture.data

    it('should return OK and entitlements', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProduct.id}/entitlements`)
        .expect(OK)

      expect(response.body).toEqual(entitlementsFixture.expectPagedDto([testEntitlement]))
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(1)
    })

    it('should return OK and an empty collection if product exists with no entitlements', async () => {
      await request(app.getHttpServer())
        .get(`/products/${testProduct.id}/entitlements`)
        .expect(OK)

      await TestUtil.deleteByIds(['1'], Entitlement)
      const response = await request(app.getHttpServer())
        .get(`/products/${testProduct.id}/entitlements`)
        .expect(OK)

      expect(response.body).toEqual(entitlementsFixture.expectPagedDto([]))
      expect(response.body.paging.totalCount).toBeGreaterThanOrEqual(0)
    })

    it('should return OK and an empty collection if product does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/-1/entitlements')
        .expect(OK)

      expect(response.body).toEqual(entitlementsFixture.expectPagedDto([]))
      expect(response.body.paging.totalCount).toEqual(0)
    })
  })

  describe('PUT /products/:id', () => {
    const { updateProductDto } = productsFixture.requestDtos

    it('should return OK and an updated Product', async () => {
      const body = snakeCaseKeys(updateProductDto, { deep: true })
      const response = await request(app.getHttpServer())
        .put(`/products/${testProduct.id}`)
        .send(body)
        .expect(OK)

      expect(response.body).toEqual(productsFixture.data.updatedProduct.toDto())
    })

    it('should return  BAD_REQUEST if extra fields are included in the request', async () => {
      const extraFields = { ...updateProductDto, id: 12, imAttackinYou: true }
      const body = snakeCaseKeys(extraFields, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/${testProduct.id}`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it.each(Object.keys(updateProductDto))('should return BAD_REQUEST if %s parameter is null', async (key) => {
      const missingFields = { ...updateProductDto }
      delete missingFields[key]
      const body = snakeCaseKeys(missingFields, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/${testProduct.id}`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      const body = snakeCaseKeys(updateProductDto, { deep: true })
      await request(app.getHttpServer())
        .put(`/products/-1`)
        .send(body)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .put(`/products/unknown`)
        .expect(BAD_REQUEST)
    })
  })

  describe('POST /products', () => {
    const { createProductDto } = productsFixture.requestDtos
    let productIds: string[] = []

    afterEach(async () => {
      if (productIds.length > 0) {
        await TestUtil.deleteByIds(productIds, Product)
        productIds = []
      }
    })

    it('should return CREATED and a created Product', async () => {
      const body = snakeCaseKeys(createProductDto, { deep: true })
      const response = await request(app.getHttpServer())
        .post(`/products`)
        .send(body)

      productIds.push(response.body.id)
      expect(response.status).toEqual(CREATED)
      expect(response.body).toEqual(productsFixture.data.createdProduct.toDto())
    })

    it('should return BAD_REQUEST if extra fields are included in the request', async () => {
      const extraFields = { ...createProductDto, id: 12, imAttackinYou: true }
      const body = snakeCaseKeys(extraFields, { deep: true })
      await request(app.getHttpServer())
        .post(`/products`)
        .send(body)
        .expect(BAD_REQUEST)
    })

    it.each(Object.keys(createProductDto))('should return BAD_REQUEST if %s parameter is null', async (key) => {
      const missingFields = { ...createProductDto }
      delete missingFields[key]
      const body = snakeCaseKeys(missingFields, { deep: true })
      await request(app.getHttpServer())
        .post(`/products`)
        .send(body)
        .expect(BAD_REQUEST)
    })
  })

  describe('DELETE /products/:id', () => {
    it('should return NO_CONTENT and an empty body', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/${testProduct.id}`)
        .expect(NO_CONTENT)

      expect(response.body).toEqual({})
    })

    it('should return NOT_FOUND if id does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/products/-1`)
        .expect(NOT_FOUND)
    })

    it('should return BAD_REQUEST if id is not a number', async () => {
      await request(app.getHttpServer())
        .delete(`/products/unknown`)
        .expect(BAD_REQUEST)
    })
  })
})
