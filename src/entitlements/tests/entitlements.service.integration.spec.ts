import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken} from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { dbConfig } from '../../database/data-source'
import { TestUtil } from '../../testing/util'
import { EntitlementsFixture, ResourcesFixture } from '../../testing/fixtures'
import { EntitlementsService } from '../entitlements.service'
import { Entitlement } from '../entitlement.entity'
import { Resource } from '../../resources/resource.entity'
import { Paging } from '../../common/paging'

describe('EntitlementsService', () => {
  const entitlementsFixture = new EntitlementsFixture()
  const { testEntitlement, testEntitlement2, createdEntitlement, updatedEntitlement } = entitlementsFixture.data
  let app: TestingModule
  let service: EntitlementsService
  let repo: Repository<Entitlement>
  let entitlement: Entitlement

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbConfig),
        TypeOrmModule.forFeature([Entitlement])
      ],
      providers: [EntitlementsService],
    }).compile()

    service = app.get<EntitlementsService>(EntitlementsService)
    repo = app.get(getRepositoryToken(Entitlement))
  })

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterEach(async () => {
    if (entitlement !== undefined) {
      await TestUtil.deleteByIds([entitlement.id.toString()], Entitlement)
      entitlement = undefined
    }
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await app.close()
  })

  describe('findAll', () => {
    const defaultPaging = new Paging()

    it('should return an array of entitlements', async () => {
      const result = await service.findAll(defaultPaging)
      expect(result).toEqual([expect.arrayContaining([testEntitlement.toEntity()]), expect.any(Number)])
      expect(result[1]).toBeGreaterThanOrEqual(1)
    })

    it('should return a paged result with limited results', async () => {
      const limit = new Paging(0, 1)
      const all = await service.findAll(defaultPaging)
      const result = await service.findAll(limit)
      expect(all[0]).toEqual(expect.arrayContaining([testEntitlement.toEntity(), testEntitlement2.toEntity()]))
      expect(result).toEqual([[ testEntitlement.toEntity() ], all[1]])
    })

    it('should return a paged result starting after the first row', async () => {
      const offset = new Paging(1, 1)
      const all = await service.findAll(defaultPaging)
      const result = await service.findAll(offset)
      expect(all[0]).toEqual(expect.arrayContaining([testEntitlement.toEntity(), testEntitlement2.toEntity()]))
      expect(result).toEqual([[ testEntitlement2.toEntity() ], all[1]])
    })
  })

  describe('getById()', () => {
    it('should return an entitlement by id', async () => {
      await expect(service.getById(testEntitlement.id)).resolves.toEqual(testEntitlement.toEntity())
    })

    it('should throw NotFoundException if entitlement does not exist', async () => {
      await expect(service.getById(-1)).rejects.toThrow(entitlementsFixture.errors.notFound)
    })
  })

  describe('getResourcesById()', () => {
    const resourcesFixture = new ResourcesFixture()

    it('should return the resource for an entitlement by entitlement id', async () => {
      const expected = [[resourcesFixture.data.testResource.toEntity()], 1]
      await expect(service.getResourcesById(testEntitlement.id)).resolves.toEqual(expected)
    })

    it('should return no results if entitlement does not exist', async () => {
      await expect(service.getResourcesById(-1)).resolves.toEqual([[], 0])
    })

    it('should return no results if entitlement has no resources', async () => {
      await expect(service.getResourcesById(testEntitlement.id)).resolves.not.toThrow()
      await TestUtil.deleteByIds(['1'], Resource)
      await expect(service.getResourcesById(testEntitlement.id)).resolves.toEqual([[], 0])
    })
  })

  describe('create()', () => {
    it('should return a newly created entitlement', async () => {
      entitlement = await service.create(entitlementsFixture.requestDtos.createEntitlementDto)
      expect(entitlement).toEqual(createdEntitlement.toEntity())
    })

    it('should throw an error when attempting to create an entitlement with a fake resource',async () => {
      const mockEntitlementDto = { ...entitlementsFixture.requestDtos.createEntitlementDto }
      mockEntitlementDto.resourceIds = [-1]
      await expect(service.create(mockEntitlementDto)).rejects.toThrowError()
    })
  })

  describe('update()', () => {
    const { updateEntitlementDto } = entitlementsFixture.requestDtos

    it('should return an updated entitlement', async () => {
      await expect(service.update(testEntitlement.id, updateEntitlementDto)).resolves.toEqual(updatedEntitlement.toEntity())
    })

    it('should throw NotFoundException if entitlement does not exist', async () => {
      await expect(service.update(-1, updateEntitlementDto)).rejects.toThrow(entitlementsFixture.errors.notFound)
    })
  })

  describe('delete()', () => {
    it('should soft delete an entitlement', async () => {
      await expect(service.delete(testEntitlement.id)).resolves.not.toThrow()
      await expect(service.getById(testEntitlement.id)).rejects.toThrow(entitlementsFixture.errors.notFound)
      const deleted = await repo.findOne({ where: { id: testEntitlement.id }, withDeleted: true })
      expect(deleted).toEqual({ ...testEntitlement.toEntity(), updatedAt: expect.anything(), deletedAt: expect.anything() })
    })

    it('should throw NotFoundException if entitlement does not exist', async () => {
      await expect(service.delete(-1)).rejects.toThrow(entitlementsFixture.errors.notFound)
    })
  })
})
