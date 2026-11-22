import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentity1763680000002 implements MigrationInterface {
  name = 'CreateIdentity1763680000002';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE app_users (
      id uuid PRIMARY KEY, google_subject text NOT NULL UNIQUE,
      email text NOT NULL, role text NOT NULL DEFAULT 'buyer'
        CHECK (role IN ('buyer', 'operator', 'cobusiness', 'admin')),
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE TABLE auth_sessions (
      token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE TABLE oidc_requests (
      state_hash text PRIMARY KEY, nonce text NOT NULL, verifier text NOT NULL,
      expires_at timestamptz NOT NULL
    )`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE oidc_requests');
    await q.query('DROP TABLE auth_sessions');
    await q.query('DROP TABLE app_users');
  }
}
