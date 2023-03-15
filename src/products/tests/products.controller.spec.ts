import { Test, TestingModule } from '@nestjs/testing'
import { ProductsController } from '../products.controller'
import { TestUtil } from '../../testing/util'
import { CommonFixture, EntitlementsFixture, ProductsFixture } from '../../testing/fixtures'
import { ProductsService } from '../products.service'
import { ProductViewsController } from '../product-views.controller'
import { GetProductDto } from '../dtos'
import { Paging } from '../../common/paging'

describe('ProductsController', () => {
  const productsFixture = new ProductsFixture()
  const entitlementsFixture = new EntitlementsFixture()
  const commonFixture = new CommonFixture()
  const { testProduct, createdProduct, updatedProduct } = productsFixture.data
  const { testEntitlement } = entitlementsFixture.data
  const { defaultPaging } = commonFixture.paging
  const error = new Error('jimmy the hamster fell off the wheel')
  let controller: ProductsController
  let viewController: ProductViewsController
  let service: ProductsService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController, ProductViewsController],
      providers: TestUtil.mockProviders([ProductsService])
    }).compile()

    controller = module.get<ProductsController>(ProductsController)
    viewController = module.get<ProductViewsController>(ProductViewsController)
    service = module.get<ProductsService>(ProductsService)
  })

  // GET /products
  describe('findAll()', () => {
    const emptyGetDto = new GetProductDto()

    it('should return the result from service', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([productsFixture.seededEntities(), 1])
      await expect(controller.findAll(emptyGetDto, defaultPaging)).resolves.toEqual([productsFixture.seededEntities(), 1])
    })

    it('should try to get products with entitlements', async () => {
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement]
      delete productEntitlement.entitlementIds
      jest.spyOn(service, 'findAll').mockResolvedValue([[ productEntitlement ], 1])
      const result = await controller.findAll(new GetProductDto({ withEntitlements: true }), defaultPaging)
      expect(result).toEqual([[ productEntitlement ], 1])
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(error)
      await expect(controller.findAll(emptyGetDto, defaultPaging)).rejects.toThrow(error)
    })
  })

  // GET /products/:id
  describe('findById()', () => {
    let getProductDto: GetProductDto

    beforeEach(() => {
      getProductDto = new GetProductDto({ ...productsFixture.requestDtos.getProductDto })
      delete getProductDto.region
    })

    it('should return the result from service', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(testProduct.toEntity())
      await expect(controller.findById(getProductDto)).resolves.toEqual(testProduct.toEntity())
    })

    it('should try to get products with entitlements', async () => {
      getProductDto.withEntitlements = true
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement]
      delete productEntitlement.entitlementIds
      jest.spyOn(service, 'getById').mockResolvedValue(productEntitlement)
      await expect(controller.findById(getProductDto)).resolves.toEqual(productEntitlement)
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'getById').mockRejectedValue(error)
      await expect(controller.findById(getProductDto)).rejects.toThrow(error)
    })
  })

  // GET /products/:id/entitlements
  describe('findEntitlementsById()', () => {

    it('should return the result from service', async () => {
      jest.spyOn(service, 'findEntitlementsById').mockResolvedValue([entitlementsFixture.seededEntities(), 1])
      await expect(viewController.findEntitlementsById(testProduct.id))
        .resolves.toEqual([entitlementsFixture.seededEntities(), 1])
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'findEntitlementsById').mockRejectedValue(error)
      await expect(viewController.findEntitlementsById(testProduct.id)).rejects.toThrow(error)
    })
  })

  // PUT /products/:id
  describe('update()', () => {
    const { updateProductDto } = productsFixture.requestDtos

    it('should return the result from service', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(updatedProduct.toEntity())
      await expect(controller.update(testProduct.id, updateProductDto)).resolves.toEqual(updatedProduct.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(error)
      await expect(controller.update(testProduct.id, updateProductDto)).rejects.toThrow(error)
    })
  })

  // POST /products
  describe('create()', () => {
    const { createProductDto } = productsFixture.requestDtos

    it('should return the result from service', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(createdProduct.toEntity())
      await expect(controller.create(createProductDto)).resolves.toEqual(createdProduct.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(error)
      await expect(controller.create(createProductDto)).rejects.toThrow(error)
    })
  })

  // DELETE /products
  describe('delete()', () => {
    it('should delete the product from service', async () => {
      await expect(controller.delete(testProduct.id)).resolves.not.toThrow()
      expect(service.delete).toHaveBeenCalledWith(testProduct.id)
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(error)
      await expect(controller.delete(testProduct.id)).rejects.toThrow(error)
    })
  })
})
