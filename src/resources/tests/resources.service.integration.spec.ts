import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'
import { ResourcesService } from '../resources.service'
import { Resource } from '../resource.entity'
import { dbConfig } from '../../database/data-source'
import { ResourcesFixture } from '../../testing/fixtures'
import { Repository } from 'typeorm'
import { TestUtil } from '../../testing/util'
import { Paging } from '../../common/paging'

describe('ResourcesService', () => {
  const resourcesFixture = new ResourcesFixture()
  const { testResource, testResource2, createdResource, updatedResource } = resourcesFixture.data
  let app: TestingModule
  let service: ResourcesService
  let repo: Repository<Resource>
  let resource: Resource

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbConfig),
        TypeOrmModule.forFeature([Resource])
      ],
      providers: [ResourcesService],
    }).compile()

    service = app.get<ResourcesService>(ResourcesService)
    repo = app.get(getRepositoryToken(Resource))
  })

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterEach(async () => {
    if (resource !== undefined) {
      await TestUtil.deleteByIds([resource.id.toString()], Resource)
      resource = undefined
    }
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await app.close()
  })

  describe('findAll', () => {
    const defaultPaging = new Paging()

    it('should return an array of Resources', async () => {
      const result = await service.findAll(defaultPaging)
      expect(result).toEqual([expect.arrayContaining([testResource.toEntity()]), expect.any(Number)])
      expect(result[1]).toBeGreaterThanOrEqual(1)
    })

    it('should return a paged result with limited results', async () => {
      const limit = new Paging(0, 1)
      const all = await service.findAll(defaultPaging)
      const result = await service.findAll(limit)
      expect(all[0]).toEqual(expect.arrayContaining([testResource.toEntity(), testResource2.toEntity()]))
      expect(result).toEqual([[ testResource.toEntity() ], all[1]])
    })

    it('should return a paged result starting after the first row', async () => {
      const offset = new Paging(1, 1)
      const all = await service.findAll(defaultPaging)
      const result = await service.findAll(offset)
      expect(all[0]).toEqual(expect.arrayContaining([testResource.toEntity(), testResource2.toEntity()]))
      expect(result).toEqual([[ testResource2.toEntity() ], all[1]])
    })
  })

  describe('getById()', () => {
    it('should return a Resource by id', async () => {
      await expect(service.getById(testResource.id)).resolves.toEqual(testResource.toEntity())
    })

    it('should throw NotFoundException if Resource does not exist', async () => {
      await expect(service.getById(-1)).rejects.toThrow(resourcesFixture.errors.notFound)
    })
  })

  describe('create()', () => {
    it('should return a newly created resource', async () => {
      resource = await service.create(resourcesFixture.requestDtos.createResourceDto)
      expect(resource).toEqual(createdResource.toEntity())
    })
  })

  describe('update()', () => {
    const { updateResourceDto } = resourcesFixture.requestDtos

    it('should return an updated resource', async () => {
      await expect(service.update(testResource.id, updateResourceDto)).resolves.toEqual(updatedResource.toEntity())
    })

    it('should throw NotFoundException if Resource does not exist', async () => {
      await expect(service.update(-1, updateResourceDto)).rejects.toThrow(resourcesFixture.errors.notFound)
    })
  })

  describe('delete()', () => {
    it('should soft delete a resource', async () => {
      await expect(service.delete(testResource.id)).resolves.not.toThrow()
      await expect(service.getById(testResource.id)).rejects.toThrow(resourcesFixture.errors.notFound)
      const deleted = await repo.findOne({ where: { id: testResource.id }, withDeleted: true })
      expect(deleted).toEqual({ ...testResource.toEntity(), updatedAt: expect.anything(), deletedAt: expect.anything() })
    })

    it('should throw NotFoundException if Resource does not exist', async () => {
      await expect(service.delete(-1)).rejects.toThrow(resourcesFixture.errors.notFound)
    })
  })
})
