import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Actor, DemoStateStore, Order } from '../../core/demo-state.store.js';
import { OfferEscrowBindingRepository } from '../../database/offer-escrow-binding.repository.js';
import { operationalOffer } from '../payments/operational-offer.js';

@Injectable()
export class OrdersService {
  constructor(private readonly state: DemoStateStore, @Optional() private readonly bindings?: OfferEscrowBindingRepository) {}

  async create(
    actor: Actor,
    input: {
      blockCount: number;
      acceptedTermsVersion: number;
      idempotencyKey: string;
      lotId?: string;
    },
  ) {
    this.requireBuyer(actor);
    const key = `${actor.id}:${input.idempotencyKey}`;
    const existingId = this.state.idempotency.get(key);
    if (existingId) {
      const existing = this.state.orders.get(existingId)!;
      if (
        existing.lotId !== (input.lotId ?? this.state.lot.id) || existing.blockCount !== input.blockCount ||
        existing.termsVersion !== input.acceptedTermsVersion
      )
        throw new ConflictException({
          code: 'IDEMPOTENCY_KEY_REUSED',
          message: 'Idempotency key was already used with different order data',
        });
      return this.receipt(existing);
    }
    const lotId = input.lotId ?? this.state.lot.id;
    const binding = lotId === this.state.lot.id ? null : await this.bindings?.find(lotId);
    if (lotId !== this.state.lot.id && !binding) throw new NotFoundException({ code: 'LOT_NOT_FOUND', message: 'Lot not found' });
    const lot = binding ? operationalOffer(binding) : this.state.lot;
    if (!Number.isSafeInteger(input.blockCount) || input.blockCount <= 0)
      throw new BadRequestException({
        code: 'INVALID_BLOCK_COUNT',
        message: 'blockCount must be a positive integer',
      });
    if (input.acceptedTermsVersion !== lot.termsVersion)
      throw new ConflictException({
        code: 'TERMS_VERSION_MISMATCH',
        message: 'Accepted terms are no longer current',
      });
    const reserved = [...this.state.orders.values()]
      .filter((order) => order.lotId === lot.id)
      .reduce((total, order) => total + order.blockCount, 0);
    if (input.blockCount > lot.totalBlocks - reserved)
      throw new ConflictException({
        code: 'LOT_CAPACITY_EXCEEDED',
        message: 'Requested blocks exceed available lot capacity',
      });
    if (Date.now() >= Date.parse(lot.fundingDeadline))
      throw new ConflictException({
        code: 'FUNDING_CLOSED',
        message: 'Lot funding deadline has passed',
      });
    const order: Order = {
      id: randomUUID(),
      lotId: lot.id,
      buyerId: actor.id,
      blockCount: input.blockCount,
      units: input.blockCount * lot.unitsPerBlock,
      amountMinor: String(
        BigInt(input.blockCount) * BigInt(lot.blockPriceMinor),
      ),
      termsVersion: lot.termsVersion,
      termsHash: lot.termsHash,
      ...(binding ? { assetContractId: binding.asset } : {}),
      idempotencyKey: input.idempotencyKey,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.state.orders.set(order.id, order);
    this.state.idempotency.set(key, order.id);
    await this.state.saveRecord('order', order.id, order);
    await this.state.saveRecord('idempotency', key, { orderId: order.id });
    return this.receipt(order);
  }

  get(actor: Actor, id: string) {
    const order = this.state.orders.get(id);
    if (!order)
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    if (
      actor.role !== 'admin' &&
      order.buyerId !== actor.id &&
      actor.role !== 'operator' &&
      actor.role !== 'cobusiness'
    )
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied',
      });
    return this.receipt(order);
  }

  receipt(order: Order) {
    return {
      ...order,
      receipt: {
        id: `receipt-${order.id}`,
        units: order.units,
        amountMinor: order.amountMinor,
        asset: order.assetContractId ?? this.state.product.asset.code,
        paymentStatus: order.status,
        termsHash: order.termsHash,
      },
    };
  }

  requireBuyer(actor: Actor) {
    if (actor.role !== 'buyer')
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'This demo identity cannot perform this action',
      });
  }
}
