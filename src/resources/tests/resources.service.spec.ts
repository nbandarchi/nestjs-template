import { Test } from '@nestjs/testing'
import { getRepositoryToken} from '@nestjs/typeorm'
import { ResourcesService } from '../resources.service'
import { TestUtil } from '../../testing/util/'
import { CommonFixture, ResourcesFixture } from '../../testing/fixtures'
import { Resource } from '../resource.entity'
import { IExtendedRepository } from 'src/database/extend-repo'
import { Paging } from '../../common/paging'

describe('ResourcesService', () => {
  const resourcesFixture = new ResourcesFixture()
  const commonFixture = new CommonFixture()
  const { testResource, testResource2, createdResource, updatedResource } = resourcesFixture.data
  const { zeroDeleted, oneDeleted } = commonFixture.updateResults
  let service: ResourcesService
  let repo: IExtendedRepository<Resource>

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        ResourcesService,
        ...TestUtil.mockRepositories([Resource])
      ],
    }).compile()

    service = app.get<ResourcesService>(ResourcesService)
    repo = app.get(getRepositoryToken(Resource))
  })

  describe('findAll', () => {
    const defaultPaging = new Paging()

    it('should return a list of Resources', async () => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([ expect.arrayContaining([testResource.toEntity()]), expect.any(Number) ])
      const result = await service.findAll(defaultPaging)
      expect(result).toEqual([expect.arrayContaining([testResource.toEntity()]), 1])
    })

    it('should return a list of paged products', async () => {
      const findAndCountBy = jest.spyOn(repo, 'findAndCount').mockResolvedValue([ [testResource2.toEntity()], 2 ])
      await service.findAll(new Paging(5, 1))
      expect(findAndCountBy).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 1 }))
    })

    it('should return an empty array if no results are found', async () => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0])
      await expect(service.findAll(defaultPaging)).resolves.toEqual([[], 0])
    })
  })

  describe('getById()', () => {
    it('should return a Resource by id', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testResource.toEntity())
      await expect(service.getById(1)).resolves.toEqual(testResource.toEntity())
    })

    it('should throw NotFoundException if id does not exist', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)
      await expect(service.getById(1)).rejects.toThrow(resourcesFixture.errors.notFound)
    })
  })

  describe('create()', () => {
    it('should create and save a new Resource', async () => {
      const create = jest.spyOn(repo, 'create').mockReturnValue(createdResource.toEntity())
      const save = jest.spyOn(repo, 'save').mockResolvedValue(createdResource.toEntity())
      await expect(service.create(resourcesFixture.requestDtos.createResourceDto)).resolves.toEqual(createdResource.toEntity())
      expect(create).toHaveBeenCalledWith(resourcesFixture.requestDtos.createResourceDto)
      expect(save).toHaveBeenCalledWith(createdResource.toEntity())
    })
  })

  describe('update()', () => {
    it('should update and save a Resource', async () => {
      jest.spyOn(<IExtendedRepository<Resource>>  repo, 'updateById').mockResolvedValue(updatedResource.toEntity())
      await expect(service.update(testResource.id, resourcesFixture.requestDtos.updateResourceDto)).resolves.toEqual(updatedResource.toEntity())
    })

    it('should throw NotFoundException if Resource does not exist', async () => {
      jest.spyOn(repo, 'updateById').mockRejectedValue(resourcesFixture.errors.notFound)
      await expect(service.update(-1, resourcesFixture.requestDtos.updateResourceDto)).rejects.toThrow(resourcesFixture.errors.notFound)
    })

    it('should throw NotFoundException if Resource does not exist', async () => {
      jest.spyOn(repo, 'updateById').mockRejectedValue(resourcesFixture.errors.notFound)
      await expect(service.update(-1, resourcesFixture.requestDtos.updateResourceDto)).rejects.toThrow(resourcesFixture.errors.notFound)
    })
  })

  describe('delete()', () => {
    it('should soft delete a resource', async () => {
      jest.spyOn(repo, 'softDelete').mockResolvedValue(oneDeleted)
      await service.delete(resourcesFixture.data.testResource.id)
      expect(repo.softDelete).toHaveBeenCalledWith({ id: testResource.id })
    })

    it('should throw NotFoundException if Resource does not exist', async () => {
      jest.spyOn(repo, 'softDelete').mockResolvedValue(zeroDeleted)
      await expect(service.delete(-1)).rejects.toThrow(resourcesFixture.errors.notFound)
    })
  })
})
