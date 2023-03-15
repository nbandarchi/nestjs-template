import { DataSource, QueryRunner } from 'typeorm'
import { EntityConstraints } from '../../database/test-migrations/entity_constraints'

class TestMigrations {
  constructor(private migrations: TestMigration[]) {  }

  private _queryRunner: QueryRunner
  public queryRunner(dataSource: DataSource) {
    if (!this._queryRunner) {
      this._queryRunner = dataSource.createQueryRunner()
    }
    return this._queryRunner
  }

  async preSeed(dataSource: DataSource) {
    this.migrations.forEach(async migration => await migration.preSeed(this.queryRunner(dataSource)))
  }

  async postSeed(dataSource: DataSource) {
    for (let i = this.migrations.length - 1; i >= 0; i--) {
      const migration = this.migrations[i]
      await migration.postSeed(this.queryRunner(dataSource))
    }
  }

  async preTeardown(dataSource: DataSource) {
    this.migrations.forEach(async migration => await migration.preTeardown(this.queryRunner(dataSource)))
  }

  async postTeardown(dataSource: DataSource) {
    for (let i = this.migrations.length - 1; i >= 0; i--) {
      const migration = this.migrations[i]
      await migration.postTeardown(this.queryRunner(dataSource))
    }
  }
}

export interface TestMigration {
  preSeed: (queryRunner: QueryRunner) => Promise<void>
  postSeed: (queryRunner: QueryRunner) => Promise<void>
  preTeardown: (queryRunner: QueryRunner) => Promise<void>
  postTeardown: (queryRunner: QueryRunner) => Promise<void>
}

export const testMigrations = new TestMigrations([
  new EntityConstraints()
])