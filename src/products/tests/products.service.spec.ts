import { Test } from '@nestjs/testing'
import { getRepositoryToken} from '@nestjs/typeorm'
import { ArrayContains, In } from 'typeorm'
import { ProductsService } from '../products.service'
import { TestUtil } from '../../testing/util/'
import { CommonFixture, EntitlementsFixture, ProductsFixture } from '../../testing/fixtures'
import { Product } from '../product.entity'
import { NotFoundException, Param } from '@nestjs/common'
import { IExtendedRepository } from 'src/database/extend-repo'
import { Entitlement } from '../../entitlements/entitlement.entity'
import { GetProductDto } from '../dtos'
import { Paging } from '../../common/paging'

describe('ProductsService', () => {
  const productsFixture = new ProductsFixture()
  const commonFixture = new CommonFixture()
  const { testProduct, createdProduct, updatedProduct, productWithRegion } = productsFixture.data
  const { zeroDeleted, oneDeleted } = commonFixture.updateResults
  const { defaultPaging } = commonFixture.paging
  const entitlementsFixture = new EntitlementsFixture()
  const { testEntitlement } = entitlementsFixture.data
  let service: ProductsService
  let repo: IExtendedRepository<Product>

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        ProductsService,
        ...TestUtil.mockRepositories([Product]),
      ],
    }).compile()

    service = app.get<ProductsService>(ProductsService)
    repo = app.get(getRepositoryToken(Product))
  })

  describe('findAll', () => {
    const emptyGetDto = new GetProductDto()

    it('should return a list of Products', async () => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[testProduct.toEntity()], 1])
      const result = await service.findAll(emptyGetDto, defaultPaging)
      expect(result).toEqual([[testProduct.toEntity()], 1])
    })

    it('should return a list of paged products', async () => {
      const findAndCountBy = jest.spyOn(repo, 'findAndCount').mockResolvedValue([ [productWithRegion.toEntity()], 2 ])
      await service.findAll(emptyGetDto, new Paging(5, 1))
      expect(findAndCountBy).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 1 }))
    })

    it('should return a list of Products with entitlements', async () => {
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      jest.spyOn(repo, 'findAndCountWithRelated').mockResolvedValue([[productEntitlement], 1])
      const result = await service.findAll(new GetProductDto({ withEntitlements: true }), defaultPaging)
      expect(result).toEqual([[productEntitlement], 1])
    })

    it('should return a list of Products from region 7', async () => {
      const findAndCountBy = jest.spyOn(repo, 'findAndCount').mockResolvedValue([[productWithRegion.toEntity()], 1])
      const result = await service.findAll(new GetProductDto({ region: 7 }), defaultPaging)
      expect(result).toEqual([[productWithRegion.toEntity()], 1])
      expect(findAndCountBy).toBeCalledWith(expect.objectContaining({where: {regionIds: ArrayContains([7])}}))
    })

    it('should return an empty array if no results are found', async () => {
      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0])
      await expect(service.findAll(emptyGetDto, defaultPaging)).resolves.toEqual([[], 0])
    })
  })

  describe('getById()', () => {
    let getProductDto: GetProductDto

    beforeEach(() => {
      getProductDto = new GetProductDto({ ...productsFixture.requestDtos.getProductDto })
      delete getProductDto.region
    })

    it('should return a Product by id', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testProduct.toEntity())
      await expect(service.getById(getProductDto)).resolves.toEqual(testProduct.toEntity())
    })

    it('should return a Product by id with entitlements', async () => {
      getProductDto.withEntitlements = true
      const productEntitlement = testProduct.toDeepCopy().toEntity()
      productEntitlement['entitlements'] = [testEntitlement.toDeepCopy().toEntity()]
      jest.spyOn(repo, 'findAndCountWithRelated').mockResolvedValue([[productEntitlement], 1])
      await expect(service.getById(getProductDto)).resolves.toEqual(productEntitlement)
    })

    it('should throw NotFoundException if id does not exist', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)
      await expect(service.getById(getProductDto)).rejects.toThrow(productsFixture.errors.notFound)
    })
  })

  describe('findEntitlementsById', () => {
    it('should return a list of entitlements for a product', async () => {
      jest.spyOn(repo, 'findRelatedAndCountBy').mockResolvedValueOnce([expect.arrayContaining([testEntitlement.toEntity()]), expect.any(Number) ])
      const result = await service.findEntitlementsById(1)
      expect(result).toEqual([expect.arrayContaining([testEntitlement.toEntity()]), 1])
    })

    it('should return an empty array if no results are found', async () => {
      jest.spyOn(repo, 'findRelatedAndCountBy').mockResolvedValue([[], 0])
      expect(await service.findEntitlementsById(-1)).toEqual([[], 0])
    })
  })

  describe('create()', () => {
    it('should create and save a new Product', async () => {
      const create = jest.spyOn(repo, 'create').mockReturnValue(createdProduct.toEntity())
      const save = jest.spyOn(repo, 'save').mockResolvedValue(createdProduct.toEntity())
      await expect(service.create(productsFixture.requestDtos.createProductDto)).resolves.toEqual(createdProduct.toEntity())
      expect(create).toHaveBeenCalledWith(productsFixture.requestDtos.createProductDto)
      expect(save).toHaveBeenCalledWith(createdProduct.toEntity())
    })
  })

  describe('update()', () => {
    it('should update and save a Product', async () => {
      jest.spyOn(<IExtendedRepository<Product>>  repo, 'updateById').mockResolvedValue(updatedProduct.toEntity())
      await expect(service.update(testProduct.id, productsFixture.requestDtos.updateProductDto)).resolves.toEqual(updatedProduct.toEntity())
    })

    it('should throw NotFoundException if Product does not exist', async () => {
      jest.spyOn(repo, 'updateById').mockRejectedValue(productsFixture.errors.notFound)
      await expect(service.update(-1, productsFixture.requestDtos.updateProductDto)).rejects.toThrow(productsFixture.errors.notFound)
    })
  })

  describe('delete()', () => {
    it('should soft delete a product', async () => {
      jest.spyOn(repo, 'softDelete').mockResolvedValue(oneDeleted)
      await service.delete(productsFixture.data.testProduct.id)
      expect(repo.softDelete).toHaveBeenCalledWith({ id: testProduct.id })
    })

    it('should throw NotFoundException if Product does not exist', async () => {
      jest.spyOn(repo, 'softDelete').mockResolvedValue(zeroDeleted)
      await expect(service.delete(-1)).rejects.toThrow(productsFixture.errors.notFound)
    })
  })
})
