import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletBindings1763680000001 implements MigrationInterface {
  name = 'CreateWalletBindings1763680000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE wallet_challenges (
      id uuid PRIMARY KEY, user_id text NOT NULL, nonce text NOT NULL,
      network text NOT NULL, expires_at timestamptz NOT NULL,
      consumed_at timestamptz
    )`);
    await queryRunner.query(`CREATE TABLE wallet_bindings (
      user_id text PRIMARY KEY, public_key text NOT NULL UNIQUE,
      network text NOT NULL, verified_at timestamptz NOT NULL DEFAULT now()
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE wallet_bindings');
    await queryRunner.query('DROP TABLE wallet_challenges');
  }
}
