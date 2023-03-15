import { MigrationInterface, QueryRunner } from "typeorm";

export class addConstraints1662051453520 implements MigrationInterface {
    name = 'addConstraints1662051453520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entitlements" ADD CONSTRAINT "resources_exist" CHECK (array_fk_exists(resource_ids, 'resources'))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "entitlements_exist" CHECK (array_fk_exists(entitlement_ids, 'entitlements'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "entitlements_exist"`);
        await queryRunner.query(`ALTER TABLE "entitlements" DROP CONSTRAINT "resources_exist"`);
    }

}
