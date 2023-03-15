# Getting a "View"
While working on the endpoints to retrieve entitlements by product or resources by entitlement we prototyped a function in `extend-repo.ts` that could handle this automatically by getting an entity by ID and providing a "chain" of entities that you wanted linked.  For example, if you wanted a product with all entitlements and resources you would use the product repo and pass in `[Entitlement, Resource]` to let the function know you wanted to join from `Product > Entitlements` and then `Entitlements > Resources`

Since this was ultimately not needed for whhat we're doing in Product Services but *is* a requirement later on, we're leaving the code here to reference later.

### Requirements/Assumptions
1. The "root" entity at any level must have a database field for `<singular_name>_ids` (ie `entitlement_ids`)
2. Each returned entity that has children will have a property added that's keyed on the entity's table name (`Product` would have `entitlements` as an array of `Entitlement`)

### Issues that may need to be addressed
1. The "chain" does not allow branching to different entities at a particular level.  It is possible, but would need additional work.
2. These functions should also likely be refactored to outer joins and be able to identify and build an entity that has an empty array of related children

```ts
    // Note: the `entityChain` assumes each entry is a "child" of the previous entry (or root entity for the first)
    // Each entity will link to exactly one other entity.  We don't currently support branching to two or more entities.
    // Could be refactored to pass an array of { from: Entity, to: Entity } or something similar
    getByIdWithJoins: async function<T>(id: number, returnType: ClassConstructor<T>, entityChain: ClassConstructor<any>[]): Promise<T> {
      const entityName = entity.name.toLowerCase()
      if (entityChain.length === 0) throw new InternalServerErrorException('request could not be completed')
      const allEntities = [entity, ...entityChain]

      const queryBuilder = (this as Repository<T>).createQueryBuilder(entityName).where({ id })
      if (!this.tableNames[entityName]) {
        this.tableNames[entityName] = this.manager.getRepository(allEntities[0]).metadata.tableName
      }
      for (let i = 0; i < allEntities.length - 1; i++) {
        const primaryName = allEntities[i].name.toLowerCase()
        const relatedName = allEntities[i + 1].name.toLowerCase()
        if (!this.tableNames[relatedName]) {
          this.tableNames[relatedName] = this.manager.getRepository(allEntities[i + 1]).metadata.tableName
        }
        queryBuilder.innerJoinAndSelect(this.tableNames[relatedName], relatedName, `${primaryName}.${relatedName}Ids @> ARRAY[${relatedName}.id]`)
      }

      const raw = await queryBuilder.getRawMany()
      if (raw.length === 0) {
        throw new NotFoundException(`${entityName.toLowerCase()} not found`)
      }  
      const mapped = mapEntities(raw, allEntities, this.tableNames)

      return plainToInstance(returnType, mapped, { ignoreDecorators: true })    
    },
```

```ts
// Returns mapped object is keyed by entity name, those value are an object keyed on ids
function mapEntities(raw: any[], entities: ClassConstructor<any>[], tableNames: { [key: string]: string }) {
  let result
  // Setup temporary storage to reduce array searches later on
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
    // Create the root entity
    if (!result) {
      const entity = entities[0].name.toLowerCase()
      result = plainToInstance(constructors[entity], item[entity])
    }
    let next = result
    // Go through the entities in order and add each one to its parent's collection
    for (let i = 1; i < entities.length; i++) {
      const entity = entities[i].name.toLowerCase()
      // Check to see if we already created this entity earlier
      if (!createdEntities[entity][row[`${entity}_id`]]) {
        const created = plainToInstance(constructors[entity], item[entity])
        createdEntities[entity][row[`${entity}_id`]] = created
      }
      // Add it to a collection on `next` keyed to the entity's table name
      if (next[tableNames[entity]] === undefined) next[tableNames[entity]] = []
      next[tableNames[entity]].push(createdEntities[entity][row[`${entity}_id`]])
      next = createdEntities[entity][row[`${entity}_id`]]
    }
  }
  return result
}
```

## Entities and DTOs

The functions above are expecting their own custom Entities and DTOs.  Fortunately we can leverage the existing entities to very quickly link them together

```ts
export class ProductEntitlements extends Product {
  entitlements: Entitlement[]
}
```

```ts
export class ProductEntitlementsDto extends ProductDto {
  @Expose()
  @Type(() => EntitlementDto)
  entitlements: EntitlementDto[]
}
```

This is all of the actual code needed to support a `Product > Entitlements` view