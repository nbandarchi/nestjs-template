import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getRepositoryToken} from '@nestjs/typeorm'
import { IExtendedRepository } from '../../database/extend-repo'
import { TestUtil } from '../../testing/util/'
import { CommonFixture, EntitlementsFixture, ResourcesFixture } from '../../testing/fixtures'
import { EntitlementsService } from '../entitlements.service'
import { Entitlement } from '../entitlement.entity'
import { Paging } from '../../common/paging'

describe('EntitlementsService', () => {
  const entitlementsFixture = new EntitlementsFixture()
  const commonFixture = new CommonFixture()
  const { testEntitlement, testEntitlement2, createdEntitlement, updatedEntitlement } = entitlementsFixture.data
  const { zeroDeleted, oneDeleted } = commonFixture.updateResults
  let service: EntitlementsService
  let repo: IExtendedRepository<Entitlement>

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        EntitlementsService,
        ...TestUtil.mockRepositories([Entitlement])
    ],
    }).compile()

    service = app.get<EntitlementsService>(EntitlementsService)
    repo = app.get(getRepositoryToken(Entitlement))
  })

  describe('findAll', () => {
    const defaultPaging = new Paging()

    it('should return a list of entitlements', async () => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([ expect.arrayContaining([testEntitlement.toEntity()]), expect.any(Number) ])
      const result = await service.findAll(defaultPaging)
      expect(result).toEqual([expect.arrayContaining([testEntitlement.toEntity()]), 1])
    })

    it('should return a list of paged entitlements', async () => {
      const findAndCountBy = jest.spyOn(repo, 'findAndCount').mockResolvedValue([ [testEntitlement2.toEntity()], 2 ])
      await service.findAll(new Paging(5, 1))
      expect(findAndCountBy).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 1 }))
    })

    it('should return an empty array if no results are found', async () => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0])
      await expect(service.findAll(defaultPaging)).resolves.toEqual([[], 0])
    })
  })

  describe('getById()', () => {
    it('should return an entitlement by id', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testEntitlement.toEntity())
      await expect(service.getById(1)).resolves.toEqual(testEntitlement.toEntity())
    })

    it('should throw NotFoundException if id does not exist', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)
      await expect(service.getById(1)).rejects.toThrow(entitlementsFixture.errors.notFound)
    })
  })

  describe('getResourcesById()', () => {
    const resourcesFixture = new ResourcesFixture()
    
    it('should return a list of resources', async () => {
      const resource = resourcesFixture.data.testResource.toDeepCopy().toEntity()
      jest.spyOn(repo, 'findRelatedAndCountBy').mockResolvedValue([[resource], 1])
      await expect(service.getResourcesById(testEntitlement.id)).resolves.toEqual([[resource], 1])
    })

    it('throw NotFoundException if thrown by repository', async () => {
      jest.spyOn(repo, 'findRelatedAndCountBy').mockRejectedValue(entitlementsFixture.errors.notFound)
      await expect(service.getResourcesById(testEntitlement.id)).rejects.toEqual(entitlementsFixture.errors.notFound)
    })
  })

  describe('create()', () => {
    it('should create and save a new entitlement', async () => {
      const create = jest.spyOn(repo, 'create').mockReturnValue(createdEntitlement.toEntity())
      const save = jest.spyOn(repo, 'save').mockResolvedValue(createdEntitlement.toEntity())
      await expect(service.create(entitlementsFixture.requestDtos.createEntitlementDto)).resolves.toEqual(createdEntitlement.toEntity())
      expect(create).toHaveBeenCalledWith(entitlementsFixture.requestDtos.createEntitlementDto)
      expect(save).toHaveBeenCalledWith(createdEntitlement.toEntity())
    })
  })

  describe('update()', () => {
    it('should update and save an entitlement', async () => {
      jest.spyOn(<IExtendedRepository<Entitlement>>  repo, 'updateById').mockResolvedValue(updatedEntitlement.toEntity())
      await expect(service.update(testEntitlement.id, entitlementsFixture.requestDtos.updateEntitlementDto)).resolves.toEqual(updatedEntitlement.toEntity())
    })

    it('should throw NotFoundException if entitlement does not exist', async () => {
      jest.spyOn(repo, 'updateById').mockRejectedValue(entitlementsFixture.errors.notFound)
      await expect(service.update(-1, entitlementsFixture.requestDtos.updateEntitlementDto)).rejects.toThrow(entitlementsFixture.errors.notFound)
    })
  })

  describe('delete()', () => {
    it('should soft delete an entitlement', async () => {
      jest.spyOn(repo, 'softDelete').mockResolvedValue(oneDeleted)
      await service.delete(entitlementsFixture.data.testEntitlement.id)
      expect(repo.softDelete).toHaveBeenCalledWith({ id: testEntitlement.id })
    })

    it('should throw NotFoundException if entitlement does not exist', async () => {
      jest.spyOn(repo, 'softDelete').mockResolvedValue(zeroDeleted)
      await expect(service.delete(-1)).rejects.toThrow(entitlementsFixture.errors.notFound)
    })
  })
})
