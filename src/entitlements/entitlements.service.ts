import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { extendRepo, IExtendedRepository } from '../database/extend-repo'
import { CreateEntitlementDto, UpdateEntitlementDto } from './dtos'
import { Entitlement } from './entitlement.entity'
import { Resource } from '../resources/resource.entity'
import { Paging } from '../common/paging'

@Injectable()
export class EntitlementsService {
  constructor(
    @InjectRepository(Entitlement)
    private repo: IExtendedRepository<Entitlement>
  ) {
    this.repo = extendRepo(this.repo, Entitlement)
  }

  async findAll(paging: Paging): Promise<[Entitlement[], Number]> {
    return await this.repo.findAndCount({ skip: paging.offset, take: paging.limit })
  }

  async create(dto: CreateEntitlementDto): Promise<Entitlement> {
    const entitlement = this.repo.create(dto)
    return await this.repo.save(entitlement)
  }

  async getById(id: number): Promise<Entitlement> {
    const entitlement = (id || id === 0) ? await this.repo.findOneBy({ id }) : null
    if (!entitlement) {
      throw new NotFoundException('entitlement not found')
    }
    return entitlement
  }

  async getResourcesById(id: number): Promise<[Resource[], Number]> {
    return await this.repo.findRelatedAndCountBy<Resource>(id, Resource)
  }

  async update(id: number, dto: UpdateEntitlementDto) {
    return await this.repo.updateById(id, dto)
  }

  async delete(id: number): Promise<void> {
    const updatedEntitlement = await this.repo.softDelete({ id })
    if (!updatedEntitlement.affected || updatedEntitlement.affected === 0) {
      throw new NotFoundException('entitlement not found')
    }
  }
}
