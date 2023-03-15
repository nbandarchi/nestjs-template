import { MigrationInterface, QueryRunner } from "typeorm";

export class addDeletedAtColumn1659395525085 implements MigrationInterface {
    name = 'addDeletedAtColumn1659395525085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deleted_at"`);
    }

}
