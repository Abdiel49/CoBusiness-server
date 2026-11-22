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
import { ReservationRepository } from '../../database/reservation.repository.js';
import { operationalOffer } from '../payments/operational-offer.js';

@Injectable()
export class OrdersService {
  constructor(private readonly state: DemoStateStore, private readonly reservations: ReservationRepository, @Optional() private readonly bindings?: OfferEscrowBindingRepository) {}

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
    if (typeof input.idempotencyKey !== 'string' || !input.idempotencyKey.trim() || input.idempotencyKey.length > 160)
      throw new BadRequestException({ code: 'INVALID_IDEMPOTENCY_KEY', message: 'Idempotency key must contain 1 to 160 characters' });
    const prior = await this.reservations.findByKey(actor.id, input.idempotencyKey);
    if (prior) {
      if (prior.lotId !== (input.lotId ?? this.state.lot.id) || prior.blockCount !== input.blockCount || prior.termsVersion !== input.acceptedTermsVersion)
        throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED', message: 'Idempotency key was already used with different order data' });
      return this.receipt(prior);
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
    const result = await this.reservations.create(order, lot.totalBlocks, lot.fundingDeadline);
    return this.receipt(result);
  }

  async get(actor: Actor, id: string) {
    const order = await this.reservations.find(id);
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    if (actor.role !== 'admin' && order.buyerId !== actor.id && actor.role !== 'operator' && actor.role !== 'cobusiness')
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Access denied' });
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
