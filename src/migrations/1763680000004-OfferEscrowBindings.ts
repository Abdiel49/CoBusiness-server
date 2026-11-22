import { MigrationInterface, QueryRunner } from 'typeorm';

/** Immutable attestation input; a saved row alone never authorizes funding. */
export class OfferEscrowBindings1763680000004 implements MigrationInterface {
  name = 'OfferEscrowBindings1763680000004';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE offer_escrow_bindings (
      offer_id text PRIMARY KEY,
      contract_id text NOT NULL UNIQUE,
      network text NOT NULL CHECK (network = 'Test SDF Network ; September 2015'),
      asset text NOT NULL,
      terms_hash text NOT NULL CHECK (terms_hash ~ '^[0-9a-f]{64}$'),
      wasm_hash text NOT NULL CHECK (wasm_hash ~ '^[0-9a-f]{64}$'),
      terms_xdr bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE FUNCTION reject_offer_binding_change() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'offer escrow bindings are immutable'; END $$`);
    await q.query(`CREATE TRIGGER immutable_offer_binding BEFORE UPDATE OR DELETE ON offer_escrow_bindings FOR EACH ROW EXECUTE FUNCTION reject_offer_binding_change()`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE offer_escrow_bindings');
    await q.query('DROP FUNCTION reject_offer_binding_change()');
  }
}
