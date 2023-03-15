import { TestMigration } from '../../testing/util/test-migrations'
import { QueryRunner } from 'typeorm'

export class EntityConstraints implements TestMigration {

    public async preSeed(queryRunner: QueryRunner): Promise<void> {
      await this.up(queryRunner)
    }

    public async postSeed(queryRunner: QueryRunner): Promise<void> {
      await this.down(queryRunner)
    }

    public async preTeardown(queryRunner: QueryRunner): Promise<void> {
      await this.up(queryRunner)
    }

    public async postTeardown(queryRunner: QueryRunner): Promise<void> {
      await this.down(queryRunner)
    }

    // Needs to be the inverse of the `add-constraints` migration.  Remove them before we making changes, then re-add when we're done.
    private async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "entitlements_exist"`);
      await queryRunner.query(`ALTER TABLE "entitlements" DROP CONSTRAINT IF EXISTS "resources_exist"`);
    }

    private async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "entitlements_exist";
      ALTER TABLE "products" ADD CONSTRAINT "entitlements_exist" CHECK (array_fk_exists(entitlement_ids, 'entitlements'))`);
      await queryRunner.query(`ALTER TABLE "entitlements" DROP CONSTRAINT IF EXISTS "resources_exist";
      ALTER TABLE "entitlements" ADD CONSTRAINT "resources_exist" CHECK (array_fk_exists(resource_ids, 'resources'))`);
    }
}
