import { Test, TestingModule } from '@nestjs/testing'
import { ResourcesController } from '../resources.controller' 
import { TestUtil } from '../../testing/util'
import { ResourcesService } from '../resources.service'
import { ResourcesFixture } from '../../testing/fixtures'
import { Paging } from '../../common/paging'

describe('ResourcesController', () => {
  const resourcesFixture = new ResourcesFixture()
  const { testResource } = resourcesFixture.data
  const error = new Error('jimmy the hamster fell off the wheel')
  let controller: ResourcesController
  let service: ResourcesService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: TestUtil.mockProviders([ResourcesService])
    }).compile()

    controller = module.get<ResourcesController>(ResourcesController)
    service = module.get<ResourcesService>(ResourcesService)
  })

  // GET /product/resources
  describe('findAll()', () => {
    const defaultPaging = new Paging()

    it('should return the result from service', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([resourcesFixture.seededEntities(), 1])
      await expect(controller.findAll(defaultPaging)).resolves.toEqual([resourcesFixture.seededEntities(), 1])
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(error)
      await expect(controller.findAll(defaultPaging)).rejects.toThrow(error)
    })
  })

  // GET /product/resources/:id
  describe('findById()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(testResource.toEntity())
      await expect(controller.findById(testResource.id)).resolves.toEqual(testResource.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'getById').mockRejectedValue(error)
      await expect(controller.findById(testResource.id)).rejects.toThrow(error)
    })
  })

  // PUT /product/resources/:id
  describe('update()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(testResource.toEntity())
      await expect(controller.update(testResource.id, resourcesFixture.requestDtos.createResourceDto)).resolves.toEqual(testResource.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(error)
      await expect(controller.update(testResource.id, resourcesFixture.requestDtos.createResourceDto)).rejects.toThrow(error)
    })
  })

  // POST /product/resources
  describe('create()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(resourcesFixture.data.createdResource.toEntity())
      await expect(controller.create(resourcesFixture.requestDtos.createResourceDto)).resolves.toEqual(resourcesFixture.data.createdResource.toEntity())
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(error)
      await expect(controller.create(resourcesFixture.requestDtos.createResourceDto)).rejects.toThrow(error)
    })
  })


  // DELETE /resources
  describe('delete()', () => {
    it('should delete the resource from service', async () => {
      await expect(controller.delete(testResource.id)).resolves.not.toThrow()
      expect(service.delete).toHaveBeenCalledWith(testResource.id)
    })

    it('should forward exceptions thrown by service', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(error)
      await expect(controller.delete(testResource.id)).rejects.toThrow(error)
    })
  })
})
