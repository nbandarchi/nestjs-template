import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { Repository, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { IGetDtoBase } from '../common/getDtoBase'
import { Paging } from '../common/paging'

export interface IExtendedRepository<T> extends Repository<T> {
  updateById(id: number, data: QueryDeepPartialEntity<T>): Promise<T>,
  findRelatedAndCountBy<T>(id: number, relatedEntities: ClassConstructor<T>): Promise<[T[], number]>
  findAndCountWithRelated<T>(getDto: IGetDtoBase<any>, paging: Paging, returnType: ClassConstructor<T>, entityChain: ClassConstructor<any>[]): Promise<[T[], number]>
}

export function extendRepo<T>(repo: Repository<T>, entity: ClassConstructor<T>): IExtendedRepository<T> {
  // Check to prevent Nest from running this again if re-using the repo
  if (repo['isExtended']) return repo as IExtendedRepository<T>

  const extended = repo.extend({
    isExtended: true,
    tableNames: {},
    updateById: async function (id: number, data: QueryDeepPartialEntity<T>): Promise<T> {
      const response: UpdateResult = await this.createQueryBuilder()
          .update(data)
          .where({ id })
          .returning('*')
          .execute()
      if (response.affected === 0) {
        throw new NotFoundException(`${entity.name.toLowerCase()} not found`)
      } else if (response.affected !== 1) {
        throw new InternalServerErrorException(`${entity.name.toLowerCase()} could not be updated`)
      }
      return plainToInstance(entity, response.raw[0])
    },
    findRelatedAndCountBy: async function<T>(id: number, relatedEntity: ClassConstructor<T>): Promise<[T[], number]> {
      const entityName = entity.name.toLowerCase()
      const tableName = getTableName(this, entity)
      const relatedEntityName = relatedEntity.name.toLowerCase()
      const relatedTableName = getTableName(this, relatedEntity)
      return await this.createQueryBuilder()
        .select(`${relatedEntityName}`)
        .distinct()
        .from(`${relatedTableName}`, `${relatedEntityName}`)
        .innerJoin(
          tableName, entityName,
          `${entityName}.${relatedEntityName}Ids @> ARRAY[${relatedEntityName}.id]`
        )
        .where(`${entityName}.id = ${id}`)
        .getManyAndCount()
    },   
    // Note: the `entityChain` assumes each entry is a "child" of the previous entry (or root entity for the first)
    // Each entity will link to exactly one other entity.  We don't currently support branching to two or more entities.
    // Could be refactored to pass an array of { from: Entity, to: Entity } or something similar
    findAndCountWithRelated: async function<T>(getDto: IGetDtoBase<any>, paging: Paging, returnType: ClassConstructor<T>, entityChain: ClassConstructor<any>[]): Promise<[T[], number]> {
        const entityName = entity.name.toLowerCase()
        if (entityChain.length === 0) throw new InternalServerErrorException('request could not be completed')
        const allEntities = [entity, ...entityChain]
  
        const queryBuilder = (this as Repository<T>).createQueryBuilder(entityName).where(getDto.toWhere())
        if (paging) {
          queryBuilder.offset(paging.offset).limit(paging.limit)
        }
        if (!this.tableNames[entityName]) {
          this.tableNames[entityName] = this.manager.getRepository(allEntities[0]).metadata.tableName
        }
        for (let i = 0; i < allEntities.length - 1; i++) {
          const primaryName = allEntities[i].name.toLowerCase()
          const relatedName = allEntities[i + 1].name.toLowerCase()
          if (!this.tableNames[relatedName]) {
            this.tableNames[relatedName] = this.manager.getRepository(allEntities[i + 1]).metadata.tableName
          }
          queryBuilder.leftJoinAndSelect(this.tableNames[relatedName], relatedName, `${primaryName}.${relatedName}Ids @> ARRAY[${relatedName}.id]`)
        }

        const raw = await queryBuilder.getRawMany()
        if (raw.length === 0) {
          throw new NotFoundException(`${entityName.toLowerCase()} not found`)
        }  
        const mapped = mapEntities(raw, allEntities, this.tableNames)
        // This final processing ensures that our results match the return type, not strictly necessary but adds a little security
        return [mapped.map(item => plainToInstance(returnType, item, { ignoreDecorators: true })), await queryBuilder.getCount()]
      }
    })
    return extended
  }

  
  // Return the full entity "view" with children.
  // Meant to be extremely fast, which is why it is also very hacky and difficult to read
  // Going through the array of rows only once and doing lookups using object keys
  function mapEntities(raw: any[], entities: ClassConstructor<any>[], tableNames: { [key: string]: string }) {
    const result = {}
    // Setup objects that we can reference later by key intead of repeated iterative searches
    const constructors = {}
    const createdEntities = {}
    entities.forEach(entity => {
      const name = entity.name.toLowerCase()
      createdEntities[name] = {}
      constructors[name] = entity
    })
    for (let row of raw) {
      const item = {}
      for (let key of Object.keys(row)) {
        // Separate out the row into distinct objects
        const [entity, ...remaining] = key.split('_')
        const property = remaining.join('_')
        if (!item[entity]) {
          item[entity] = {}
        }
        item[entity][property] = row[key]
      }
  
      // Initialize the root object to mimic an entity with child collection
      // ie: If our top level is Product we want `{ products: [] }`
      if (Object.keys(result).length === 0) {
        result[tableNames[entities[0].name.toLowerCase()]] = []
      }
      let next = result
      // Go through the entities in order and add it to the parent's collection
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i].name.toLowerCase()
        // Skip Null ids that were brought back in the LEFT JOIN
        if(row[`${entity}_id`] !== null) {
          // Check to see if we already created this entity earlier
          if (!createdEntities[entity][row[`${entity}_id`]]) {
            const created = plainToInstance(constructors[entity], item[entity])
            // Initialize an empty array if this might have child entities
            if (i < entities.length - 1) {
              created[tableNames[entities[i + 1].name.toLowerCase()]] = []
            }
            createdEntities[entity][row[`${entity}_id`]] = created
          }
          // Add it to a collection on `next` keyed to the entity's table name
          next[tableNames[entity]].push(createdEntities[entity][row[`${entity}_id`]])
          next = createdEntities[entity][row[`${entity}_id`]]
        }
      }
    }
    // Return the collection attached to the root object
    // This will be an array of our top level entity
    return result[tableNames[entities[0].name.toLowerCase()]]
  }


function getTableName(instance: Repository<any>, entity: ClassConstructor<any>): string {
  const name = entity.name.toLowerCase()
  if (!instance['tableNames'][name]) {
    instance['tableNames'][name] = instance.manager.getRepository(entity).metadata.tableName
  }
  return instance['tableNames'][name]
}