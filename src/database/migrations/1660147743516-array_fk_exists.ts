import { MigrationInterface, QueryRunner } from "typeorm"

export class arrayFkExists1660147743516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // The `do $$ ... exception` block is catching the case where we create a duplicate function
    // Could also drop the function before creating, code from `down` can be uncommented and copied here
        await queryRunner.query(`
    do $$
    BEGIN
      CREATE FUNCTION array_fk_exists(arr int[], tbl regclass, OUT result boolean)
          LANGUAGE plpgsql AS
      $func$
      BEGIN
          EXECUTE format('
              SELECT CASE 
              WHEN %L = ARRAY[]::integer[] 
              OR EXISTS(SELECT 1 FROM %s WHERE id = ANY(%L)) THEN
                  true 
              ELSE
                  false 
              END', arr, tbl, arr)
          INTO result;
      END
      $func$;
    exception
      when duplicate_function then
      null;
    end; $$`
  );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      // Do nothing, deleting the function automatically is not necessarily safe
      // await queryRunner.query(`DROP FUNCTION IF EXISTS array_fk_exists`);
    }

}
