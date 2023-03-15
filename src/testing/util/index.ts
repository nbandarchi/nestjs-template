import dataSource from '../../database/data-source'
import { mockProviders, mockRepositories } from './mock-providers'
import * as _fixtures from '../fixtures'
import { BaseFixture } from '../fixtures/base.fixture'
import { ClassConstructor } from 'class-transformer'
import { testMigrations } from './test-migrations'

const { CommonFixture, ...fixtures } = _fixtures

export class TestUtil { 
  public static mockProviders = mockProviders
  public static mockRepositories = mockRepositories

  public static async createTestDbRecords() {
    if (!dataSource.isInitialized) await dataSource.initialize()
    await testMigrations.preSeed(dataSource)
    for(let key of Object.keys(fixtures)) {
      const fixture: BaseFixture<any, any> = new fixtures[key]()
      await fixture.seedTestData(dataSource)
    }
    await testMigrations.postSeed(dataSource)
  }

  public static async deleteTestDbRecords() {
    if (!dataSource.isInitialized) await dataSource.initialize()
    await testMigrations.preTeardown(dataSource)
    for(let key of Object.keys(fixtures)) {
      const fixture: BaseFixture<any, any> = new fixtures[key]()
      await fixture.teardownTestData(dataSource)
    }
    await testMigrations.postTeardown(dataSource)
  }

  public static async deleteByIds(ids: string[], entity: ClassConstructor<any>) {
    if (!dataSource.isInitialized) await dataSource.initialize()
    const repo = dataSource.getRepository(entity)
    await repo.delete(ids)
  }

  public static async teardownTestDb() {
    await dataSource.destroy()
  }
}
