import { MigrationInterface, QueryRunner } from 'typeorm';

export class AtomicOrders1763680000005 implements MigrationInterface {
  name = 'AtomicOrders1763680000005';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE reservation_orders (
      id text PRIMARY KEY, buyer_id text NOT NULL, lot_id text NOT NULL,
      idempotency_key text NOT NULL, block_count integer NOT NULL CHECK (block_count > 0),
      payload jsonb NOT NULL, UNIQUE (buyer_id, idempotency_key)
    )`);
    await q.query('CREATE INDEX reservation_orders_lot ON reservation_orders (lot_id)');
    await q.query(`INSERT INTO reservation_orders (id, buyer_id, lot_id, idempotency_key, block_count, payload)
      SELECT record_id, payload->>'buyerId', payload->>'lotId', payload->>'idempotencyKey',
        (payload->>'blockCount')::integer, payload FROM domain_records WHERE kind = 'order'`);
  }
  async down(): Promise<void> { throw new Error('Orders cannot be safely downgraded without losing reservations'); }
}
