import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateResourceDto, UpdateResourceDto } from './dtos'
import { Resource } from './resource.entity'
import { extendRepo, IExtendedRepository } from '../database/extend-repo'
import { Paging } from '../common/paging'

@Injectable()
export class ResourcesService {
  constructor(@InjectRepository(Resource) private repo: IExtendedRepository<Resource>) {
    this.repo = extendRepo(this.repo, Resource)
  }

  async findAll(paging: Paging): Promise<[Resource[], Number]> {
    return await this.repo.findAndCount({ skip: paging.offset, take: paging.limit })
  }

  async getById(id: number): Promise<Resource> {
    const resource = (id || id === 0) ? await this.repo.findOneBy({ id }) : null
    if (!resource) {
      throw new NotFoundException('resource not found')
    }
    return resource
  }

  async create(dto: CreateResourceDto): Promise<Resource> {
    const resource = this.repo.create(dto)
    return await this.repo.save(resource)
  }

  async update(id: number, dto: UpdateResourceDto): Promise<Resource> {
    return await this.repo.updateById(id, dto)
  }

  async delete(id: number): Promise<void> {
    const updatedResource = await this.repo.softDelete({ id })
    if (!updatedResource.affected || updatedResource.affected == 0) {
      throw new NotFoundException('resource not found')
    }
  }
}
