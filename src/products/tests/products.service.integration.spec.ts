import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken} from '@nestjs/typeorm'
import { ProductsService } from '../products.service'
import { Product } from '../product.entity'
import { Entitlement } from '../../entitlements/entitlement.entity'
import { dbConfig } from '../../database/data-source'
import { ProductsFixture, EntitlementsFixture, CommonFixture } from '../../testing/fixtures'
import { Repository } from 'typeorm'
import { TestUtil } from '../../testing/util'
import { GetProductDto } from '../dtos'
import { Paging } from '../../common/paging'

describe('ProductsService', () => {
  const productsFixture = new ProductsFixture()
  const entitlementsFixture = new EntitlementsFixture()
  const commonFixture = new CommonFixture()
  const { testProduct, createdProduct, updatedProduct, productWithRegion } = productsFixture.data
  const { testEntitlement } = entitlementsFixture.data
  const { defaultPaging } = commonFixture.paging
  let app: TestingModule
  let service: ProductsService
  let repo: Repository<Product>
  let product: Product

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbConfig),
        TypeOrmModule.forFeature([Product]),
        TypeOrmModule.forFeature([Entitlement])
      ],
      providers: [ProductsService],
    }).compile()

    service = app.get<ProductsService>(ProductsService)
    repo = app.get(getRepositoryToken(Product))
  })

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterEach(async () => {
    if (product !== undefined) {
      await TestUtil.deleteByIds([product.id.toString()], Product)
      product = undefined
    }
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await app.close()
  })

  describe('findAll', () => {
    const emptyGetDto = new GetProductDto

    it('should return an array of Products', async () => {
      const result = await service.findAll(emptyGetDto, defaultPaging)
      expect(result).toEqual([expect.arrayContaining([testProduct.toEntity()]), expect.any(Number)])
      expect(result[1]).toBeGreaterThanOrEqual(1)
    })

    it('should return a paged result with limited results', async () => {
      const limit = new Paging(0, 1)
      const all = await service.findAll(emptyGetDto, defaultPaging)
      const result = await service.findAll(emptyGetDto, limit)
      expect(all[0]).toEqual(expect.arrayContaining([testProduct.toEntity(), productWithRegion.toEntity()]))
      expect(result).toEqual([[ testProduct.toEntity() ], all[1]])
    })

    it('should return a paged result starting after the first row', async () => {
      const offset = new Paging(1, 1)
      const all = await service.findAll(emptyGetDto, defaultPaging)
      const result = await service.findAll(emptyGetDto, offset)
      expect(all[0]).toEqual(expect.arrayContaining([testProduct.toEntity(), productWithRegion.toEntity()]))
      expect(result).toEqual([[ productWithRegion.toEntity() ], all[1]])
    })

    it('should return an array of Products with entitlements', async () => {
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      const result = await service.findAll(new GetProductDto({ withEntitlements: true }), defaultPaging)
      expect(result).toEqual([expect.arrayContaining([productEntitlement]), expect.any(Number)])
      expect(result[1]).toBeGreaterThanOrEqual(1)
    })

    it('should return a paged result with entitlements and limited results', async () => {
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      const productWithRegionEntitlement = productWithRegion.toDeepCopy().toEntity()
      productWithRegionEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      const limit = new Paging(0, 1)
      const all = await service.findAll(new GetProductDto({ withEntitlements: true }), defaultPaging)
      const result = await service.findAll(new GetProductDto({ withEntitlements: true }), limit)
      expect(all[0]).toEqual(expect.arrayContaining([productEntitlement, productWithRegionEntitlement]))
      expect(result).toEqual([[ productEntitlement ], all[1]])
    })

    it('should return a paged result with entitlements starting after the first row', async () => {
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      const productWithRegionEntitlement = productWithRegion.toDeepCopy().toEntity()
      productWithRegionEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      const offset = new Paging(1, 1)
      const all = await service.findAll(new GetProductDto({ withEntitlements: true }), defaultPaging)
      const result = await service.findAll(new GetProductDto({ withEntitlements: true }), offset)
      expect(all[0]).toEqual(expect.arrayContaining([productEntitlement, productWithRegionEntitlement]))
      expect(result).toEqual([[ productWithRegionEntitlement ], all[1]])
    })

    it('should return a list of Products from region 7', async () => {
      const result = await service.findAll( new GetProductDto({ region: 7 }), defaultPaging)
      expect(result).toEqual([expect.arrayContaining([productWithRegion.toEntity()]), expect.any(Number)])
      expect(result[0]).not.toEqual(expect.arrayContaining([testProduct.toEntity()]))
      expect(result[1]).toBeGreaterThanOrEqual(1)
    })

    it('should return an empty list of Products when region is 3', async () => {
      const result = await service.findAll(new GetProductDto({ region: 3 }), defaultPaging)
      expect(result).toEqual([[], 0])
    })
  })

  describe('getById()', () => {
    let getProductDto: GetProductDto

    beforeEach(() => {
      getProductDto = new GetProductDto({ ...productsFixture.requestDtos.getProductDto })
      delete getProductDto.region
    })

    it('should return a Product by id', async () => {
      await expect(service.getById(getProductDto)).resolves.toEqual(testProduct.toEntity())
    })

    it('should return a Product by id with entitlements', async () => {
      getProductDto.withEntitlements = true
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      await expect(service.getById(getProductDto)).resolves.toEqual(productEntitlement)
    })

    it('should throw NotFoundException if Product does not exist', async () => {
      getProductDto.id = -1
      await expect(service.getById(getProductDto)).rejects.toThrow(productsFixture.errors.notFound)
    })
  })

  describe('findEntitlementsById()', () => {
    it('should return an array of entitlements for a single product', async () => {
      const result = await service.findEntitlementsById(testProduct.id)

      expect(result).toEqual([expect.arrayContaining([testEntitlement.toEntity()]), expect.any(Number)])
      expect(result[1]).toBeGreaterThanOrEqual(1)
    })

    it('should return an empty array if product has no entitlements', async () => {
      await TestUtil.deleteByIds(['1'], Entitlement)
      const result = await service.findEntitlementsById(testProduct.id)
      expect(result).toEqual([[], 0])
    })

    it('should return an empty array if product does not exist', async () => {
      expect(await service.findEntitlementsById(-1)).toEqual([[], 0])
    })
  })

  describe('create()', () => {
    it('should return a newly created product', async () => {
      product = await service.create(productsFixture.requestDtos.createProductDto)
      expect(product).toEqual(createdProduct.toEntity())
    })

    it('should throw error when attempting to create a product with a fake entitlement',async () => {
      const mockProductDto = { ...productsFixture.requestDtos.createProductDto }
      mockProductDto.entitlementIds = [-1]
      await expect(service.create(mockProductDto)).rejects.toThrowError()
    })
  })

  describe('update()', () => {
    const { updateProductDto } = productsFixture.requestDtos

    it('should return an updated product', async () => {
      await expect(service.update(testProduct.id, updateProductDto)).resolves.toEqual(updatedProduct.toEntity())
    })

    it('should throw NotFoundException if Product does not exist', async () => {
      await expect(service.update(-1, updateProductDto)).rejects.toThrow(productsFixture.errors.notFound)
    })
  })

  describe('delete()', () => {
    it('should soft delete a product', async () => {
      await expect(service.delete(testProduct.id)).resolves.not.toThrow()
      await expect(service.getById(new GetProductDto({id: testProduct.id }))).rejects.toThrow(productsFixture.errors.notFound)
      const deleted = await repo.findOne({ where: { id: testProduct.id }, withDeleted: true })
      expect(deleted).toEqual({ ...testProduct.toEntity(), updatedAt: expect.anything(), deletedAt: expect.anything() })
    })

    it('should throw NotFoundException if Product does not exist', async () => {
      await expect(service.delete(-1)).rejects.toThrow(productsFixture.errors.notFound)
    })
  })
})
