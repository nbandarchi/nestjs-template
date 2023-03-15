import { ClassConstructor, plainToInstance } from 'class-transformer'
import { DataSource, UpdateResult } from 'typeorm'
import cloneDeep from 'lodash.clonedeep'
import snakeCaseKeys from 'snakecase-keys'
import { snakeCase } from 'snake-case'
import { config } from '../../config'

// These give us a 'type' that strips functions from a class
// Lets us pass in a generic object in the implementation while still enforcing types
// https://stackoverflow.com/questions/58210331/exclude-function-types-from-an-object-type
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

// A type with just the helper functions we plan to add
type HelperMethods<TEntity, TDto> = {
    toPlainObject: () => SourceDataItem<TEntity>,
    toDeepCopy: () => DataItem<TEntity, TDto>,
    toEntity: (writeDatabase?: boolean) => TEntity,
    toDto: () => TDto,
}

// Combining into strong types to represent our plain input item, and a new object with helpers
export type SourceDataItem<TEntity> = Required<NonFunctionProperties<TEntity>>
export type DataItem<TEntity, TDto> = SourceDataItem<TEntity> & Partial<HelperMethods<TEntity, TDto>>

export abstract class BaseFixture<TEntity, TDto> {
    constructor(
        // Need to pass in the type so we can instatiate it, no way to do that with the generics
        private readonly entityType: ClassConstructor<TEntity>,
    ) { }

    public initialize() {
        this.initializeData()
    }

    private initializeData() {
        if (Object.keys(this.data).length === 0) throw new Error('Data cannot be empty')
        const entityType = this.entityType
        const toDto = this.toDto
        const sourceItemKeys = []
        const dates = ['createdAt', 'updatedAt', 'deletedAt']

        for(let key of Object.keys(this.data)) {
            if (sourceItemKeys.length === 0) sourceItemKeys.push(...Object.keys(this.data[key]))
            this.data[key] = { 
                // Copy all of the original data over
                ...this.data[key],

                // Return the plain object
                toPlainObject: function(writeDatabase?: false): SourceDataItem<TEntity> {
                  const result = {}
                  sourceItemKeys.forEach(key => {
                      if (writeDatabase && dates.indexOf(key) !== -1 && !(this[key] instanceof Date) && this[key]) {
                        result[key] = new Date()
                      } else {
                        result[key] = this[key]
                      }
                    }
                  )
                  return result as SourceDataItem<TEntity>
                },

                // Return a deep copy
                toDeepCopy: function(): DataItem<TEntity, TDto> {
                  return cloneDeep(this)
                },

                // Convert the plain object to a typed Entity
                toEntity: function(writeDatabase?: false): TEntity {
                    return plainToInstance(entityType, this.toPlainObject(writeDatabase), { ignoreDecorators: true })
                },

                // Convert the raw values into a dto
                // The binding hard-codes the first argument to this object
                toDto: function(): TDto {
                  return toDto(this.toPlainObject())
                }
            }
        }
    }

    // This function is separate from the other helpers so it can be overriden in a child class
    public toDto(entity: TEntity): TDto {
      const dto = {}
      const dates = ['createdAt', 'updatedAt', 'deletedAt']
      for (let key of Object.keys(entity)) {
        // Actual dates need to be converted into a string
        if (dates.indexOf(key) !== -1 && entity[key] instanceof Date) {
          dto[snakeCase(key)] = entity[key].toISOString()
        // Objects other than `expect.anything()` should be deep copied with snakecase keys
        // snakeCaseKeys does not convert jest matchers correctly
        } else if (typeof entity[key] === 'object' && entity[key] !== null && entity[key]['$$typeof'] !== Symbol.for('jest.asymmetricMatcher')) {
          dto[snakeCase(key)] = snakeCaseKeys(entity[key], { deep: true })
        // Primitive types and `expect.anything()` should be returned as is
        } else {
          dto[snakeCase(key)] = entity[key]     
        }
      }
      return dto as TDto
    }
   
    public toEntities(values?: DataItem<TEntity, TDto>[]): TEntity[] {
      values = values || Object.values(this.data)
        return Object.values(values).map(item => {
            return item.toEntity()
        })
    }

    public seededEntities(): TEntity[] {
      return this.entityKeysToSeed.map(key => this.data[key].toEntity())
    }    

    public expectPagedDto(values?: DataItem<TEntity, TDto>[]) {
        values = values || Object.values(this.data)
        return {
            items: expect.arrayContaining(values.map(item => item.toDto())),
            paging: {
                offset: expect.any(Number),
                limit: expect.any(Number),
                totalCount: expect.any(Number),
            }
        }
    }

    public async seedTestData(dataSource: DataSource) {
      const repo = dataSource.getRepository(this.entityType)
      // Since we are saving with the full entity, the ID will be saved and break the PK sequence
      const entities = this.entityKeysToSeed.map(key => {
        return repo.create(this.data[key].toEntity(true))
      })
      await repo.save(entities)
      const tableName = repo.metadata.tableName
      // Reset the PK sequence to greater of either seeded record count or the last used value
      const query = `SELECT setval('${config.postgres.schema}.${tableName}_id_seq', GREATEST((SELECT last_value FROM ${config.postgres.schema}.${tableName}_id_seq), ${this.entityKeysToSeed.length}), true)`
      await dataSource.query(query)
    }

    public async teardownTestData(dataSource: DataSource) {
      const ids = this.entityKeysToSeed.map(key => this.data[key]['id'])
      dataSource.manager.getRepository(this.entityType).metadata.tableName
      const repo = dataSource.getRepository(this.entityType)
      await repo.delete(ids)
    }

    public dates:Array<string>
    public abstract readonly data: { [key: string]:  DataItem<TEntity, TDto>}
    public abstract readonly errors: { [key: string]: Error }

    public abstract readonly requestDtos: { [key: string]: any }
    public entityKeysToSeed: string[] = []

}
