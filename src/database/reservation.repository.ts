import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Order } from '../core/demo-state.store.js';

@Injectable()
export class ReservationRepository {
  constructor(private readonly db: DataSource) {}

  async create(order: Order, capacity: number, deadline: string): Promise<Order> {
    return this.db.transaction(async (manager) => {
      // Transaction-scoped database locks serialize retries and capacity checks across instances.
      await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`reservation:buyer:${order.buyerId}:${order.idempotencyKey}`]);
      const prior: Array<{ payload: Order }> = await manager.query('SELECT payload FROM reservation_orders WHERE buyer_id = $1 AND idempotency_key = $2', [order.buyerId, order.idempotencyKey]);
      if (prior.length) {
        const existing = prior[0].payload;
        if (existing.lotId !== order.lotId || existing.blockCount !== order.blockCount || existing.termsVersion !== order.termsVersion)
          throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED', message: 'Idempotency key was already used with different order data' });
        return existing;
      }
      await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`reservation:lot:${order.lotId}`]);
      const totals: Array<{ reserved: string; closed: boolean }> = await manager.query(`SELECT COALESCE(sum(block_count), 0)::text AS reserved, clock_timestamp() >= $2::timestamptz AS closed FROM reservation_orders WHERE lot_id = $1`, [order.lotId, deadline]);
      if (totals[0].closed) throw new ConflictException({ code: 'FUNDING_CLOSED', message: 'Lot funding deadline has passed' });
      if (order.blockCount > capacity - Number(totals[0].reserved)) throw new ConflictException({ code: 'LOT_CAPACITY_EXCEEDED', message: 'Requested blocks exceed available lot capacity' });
      await manager.query('INSERT INTO reservation_orders (id,buyer_id,lot_id,idempotency_key,block_count,payload) VALUES ($1,$2,$3,$4,$5,$6::jsonb)', [order.id, order.buyerId, order.lotId, order.idempotencyKey, order.blockCount, JSON.stringify(order)]);
      return order;
    });
  }
  async findByKey(buyerId: string, key: string): Promise<Order | null> {
    const rows: Array<{ payload: Order }> = await this.db.query('SELECT payload FROM reservation_orders WHERE buyer_id=$1 AND idempotency_key=$2', [buyerId, key]);
    return rows[0]?.payload ?? null;
  }
  async find(id: string): Promise<Order | null> {
    const rows: Array<{ payload: Order }> = await this.db.query('SELECT payload FROM reservation_orders WHERE id=$1', [id]);
    return rows[0]?.payload ?? null;
  }
  async reserved(lotId: string): Promise<number> {
    const rows: Array<{ total: string }> = await this.db.query('SELECT COALESCE(sum(block_count), 0)::text AS total FROM reservation_orders WHERE lot_id=$1', [lotId]);
    return Number(rows[0].total);
  }
}
