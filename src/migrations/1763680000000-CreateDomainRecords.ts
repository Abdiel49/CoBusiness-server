import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDomainRecords1763680000000 implements MigrationInterface {
  name = 'CreateDomainRecords1763680000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "domain_records" ("id" uuid NOT NULL, "kind" character varying(80) NOT NULL, "record_id" character varying(160) NOT NULL, "payload" jsonb NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_domain_records" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_domain_records_kind_record" ON "domain_records" ("kind", "record_id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "migration_checkpoints" ("source" character varying(80) NOT NULL, "cursor" jsonb NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_migration_checkpoints" PRIMARY KEY ("source"))`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "migration_checkpoints"');
    await queryRunner.query('DROP INDEX "IDX_domain_records_kind_record"');
    await queryRunner.query('DROP TABLE "domain_records"');
  }
}
