import { Test, TestingModule } from '@nestjs/testing'
import { TestUtil } from '../../testing/util'
import { EntitlementsFixture, ResourcesFixture } from '../../testing/fixtures'
import { EntitlementsController } from '../entitlements.controller'
import { EntitlementsService } from '../entitlements.service'
import { EntitlementViewsController } from '../entitlement-views.controller'
import { EntitlementsModule } from '../entitlements.module'
import { Paging } from '../../common/paging'

describe('EntitlementsController', () => {
  const entitlementsFixture = new EntitlementsFixture()
  const { testEntitlement } = entitlementsFixture.data
  const error = new Error('generic error')
  let controller: EntitlementsController
  let viewController: EntitlementViewsController
  let service: EntitlementsService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntitlementsController, EntitlementViewsController],
      providers: TestUtil.mockProviders([EntitlementsService])
    }).compile()

    controller = module.get<EntitlementsController>(EntitlementsController)
    viewController = module.get<EntitlementViewsController>(EntitlementViewsController)
    service = module.get<EntitlementsService>(EntitlementsService)
  })

  // GET /products/entitlements
  describe('findAll()', () => {
    const defaultPaging = new Paging()

    it('should return the result from service', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([entitlementsFixture.seededEntities(), 1])
      await expect(controller.findAll(defaultPaging)).resolves.toEqual([entitlementsFixture.seededEntities(), 1])
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(error)
      await expect(controller.findAll(defaultPaging)).rejects.toThrow(error)
    })
  })

  // POST /products/entitlements/
  describe('create()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(testEntitlement.toEntity())
      await expect(controller.create(entitlementsFixture.requestDtos.createEntitlementDto)).resolves
        .toEqual(testEntitlement.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(error)
      await expect(controller.create(entitlementsFixture.requestDtos.createEntitlementDto)).rejects.toThrow(error)
    })
  })

  // GET /products/entitlements/:id
  describe('findById()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(testEntitlement.toEntity())
      await expect(controller.findById(testEntitlement.id))
        .resolves.toEqual(testEntitlement.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'getById').mockRejectedValue(error)
      await expect(controller.findById(testEntitlement.id)).rejects.toThrow(error)
    })
  })

  // GET /products/entitlements/:id/resources
  describe('findResourcesById()', () => {
    const resourcesFixture = new ResourcesFixture()

    it('should return the result from service', async () => {
      jest.spyOn(service, 'getResourcesById').mockResolvedValue([resourcesFixture.seededEntities(), 1])
      await expect(viewController.findResourcesById(testEntitlement.id))
        .resolves.toEqual([resourcesFixture.seededEntities(), 1])
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'getResourcesById').mockRejectedValue(error)
      await expect(viewController.findResourcesById(testEntitlement.id)).rejects.toThrow(error)
    })
  })

  // PUT /products/entitlements/:id
  describe('update()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(testEntitlement.toEntity())
      await expect(controller.update(testEntitlement.id, entitlementsFixture.requestDtos.createEntitlementDto)).resolves
        .toEqual(testEntitlement.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(error)
      await expect(controller.update(testEntitlement.id, entitlementsFixture.requestDtos.createEntitlementDto)).rejects.toThrow(error)
    })
  })

  // DELETE /entitlements
  describe('delete()', () => {
    it('should delete the entitlement from service', async () => {
      await expect(controller.delete(testEntitlement.id)).resolves.not.toThrow()
      expect(service.delete).toHaveBeenCalledWith(testEntitlement.id)
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(error)
      await expect(controller.delete(testEntitlement.id)).rejects.toThrow(error)
    })
  })
})
