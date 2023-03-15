import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ArrayContains, In } from 'typeorm'
import { CreateProductDto, GetProductDto, UpdateProductDto } from './dtos'
import { Product, ProductEntitlements } from './product.entity'
import { extendRepo, IExtendedRepository } from '../database/extend-repo'
import { Entitlement } from '../entitlements/entitlement.entity'
import { Paging } from '../common/paging'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: IExtendedRepository<Product>) {
    this.repo = extendRepo(this.repo, Product)
  }

  async findAll(dto: GetProductDto, paging: Paging): Promise<[Product[] | ProductEntitlements[], Number]> {
    if (dto.withEntitlements) {
      return await this.repo.findAndCountWithRelated<ProductEntitlements>(dto, paging, ProductEntitlements, [Entitlement])
    } else {
      return await this.repo.findAndCount({ where: dto.toWhere(), skip: paging.offset, take: paging.limit })
    }
  }

  async getById(dto: GetProductDto): Promise<Product | ProductEntitlements> {
    let product: Product | ProductEntitlements
    if (dto && dto.id > 0) {
      if (dto.withEntitlements) {
        const results = await this.repo.findAndCountWithRelated<ProductEntitlements>(dto, null, ProductEntitlements, [Entitlement])
        product = results[1] > 0 ? results[0][0] : undefined
      } else {
        product = await this.repo.findOneBy(dto.toWhere())
      }
    }
    if (!product) {
      throw new NotFoundException('product not found')
    }
    return product
  }

  async findEntitlementsById(id: number): Promise<[Entitlement[], Number]> {
    return await this.repo.findRelatedAndCountBy(id, Entitlement)
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create(dto)
    return await this.repo.save(product)
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    return await this.repo.updateById(id, dto)
  }

  async delete(id: number): Promise<void> {
    const updatedProduct = await this.repo.softDelete({ id })
    if (!updatedProduct.affected || updatedProduct.affected == 0) {
      throw new NotFoundException('product not found')
    }
  }
}
