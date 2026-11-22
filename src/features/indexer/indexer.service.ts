import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ChainEvent, DemoStateStore } from '../../core/demo-state.store.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class IndexerService {
  constructor(
    private readonly state: DemoStateStore,
    private readonly audit: AuditService,
  ) {}

  escrow() {
    return {
      lotId: this.state.lot.id,
      status: this.state.lot.escrowStatus,
      confirmed: {
        fundedAmountMinor: String(
          BigInt(this.state.lot.blocksFunded) *
            BigInt(this.state.lot.blockPriceMinor),
        ),
        releasedAmountMinor: this.sum('released'),
        refundedAmountMinor: this.sum('refunded'),
      },
      lastSyncedAt: this.latestEventDate(),
      sync: { lagSeconds: 0, healthy: true, source: 'fixture' },
      events: [...this.state.events.values()],
    };
  }

  async ingest(input: Omit<ChainEvent, 'id' | 'createdAt'>) {
    if (!input.confirmed)
      return { accepted: false, reason: 'unconfirmed events are not applied' };
    if (
      input.network !== 'Test SDF Network ; September 2015' ||
      input.contractId !== 'UNCONFIGURED'
    )
      throw new BadRequestException({
        code: 'CHAIN_CONTRACT_MISMATCH',
        message:
          'Event network or contract does not match configured demo contract',
      });
    if (
      !/^[0-9]+$/.test(input.amountMinor) ||
      (input.type === 'refund_enabled'
        ? BigInt(input.amountMinor) !== 0n
        : BigInt(input.amountMinor) <= 0n)
    )
      throw new BadRequestException({
        code: 'INVALID_EVENT_AMOUNT',
        message: 'Event amount must be valid integer minor units for its type',
      });
    if (input.lotId !== this.state.lot.id)
      throw new BadRequestException({
        code: 'LOT_MISMATCH',
        message: 'Event lot does not match the configured demo lot',
      });
    const id = `${input.network}:${input.contractId}:${input.txHash}:${input.ledger}:${input.type}`;
    if (this.state.events.has(id)) return { accepted: true, duplicate: true };

    if (input.type === 'funded') this.validateFunding(input);
    if (input.type === 'released') this.validateRelease(input.amountMinor);
    if (input.type === 'refunded') this.validateRefund(input);

    const event = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    } satisfies ChainEvent;
    this.state.events.set(id, event);
    if (event.type === 'funded') await this.applyFunding(event);
    else if (event.type === 'released' || event.type === 'refunded')
      await this.applyClose(event);
    else this.state.lot.refundEnabled = true;

    await this.state.saveRecord('event', id, event);
    await this.state.saveRecord('lot', this.state.lot.id, this.state.lot);
    await this.audit.record('chain.event.confirmed', 'indexer', {
      eventId: id,
    });
    return { accepted: true, duplicate: false };
  }

  sum(type: ChainEvent['type'], orderId?: string) {
    return String(
      [...this.state.events.values()]
        .filter(
          (event) =>
            event.type === type && (!orderId || event.orderId === orderId),
        )
        .reduce((total, event) => total + BigInt(event.amountMinor), 0n),
    );
  }

  private validateFunding(input: Omit<ChainEvent, 'id' | 'createdAt'>) {
    const price = BigInt(this.state.lot.blockPriceMinor);
    const amount = BigInt(input.amountMinor);
    if (amount % price !== 0n)
      throw new BadRequestException({
        code: 'INVALID_EVENT_AMOUNT',
        message: 'Funding event must contain whole blocks',
      });
    const blocks = Number(amount / price);
    if (this.state.lot.blocksFunded + blocks > this.state.lot.totalBlocks)
      throw new ConflictException({
        code: 'LOT_CAPACITY_EXCEEDED',
        message: 'Confirmed funding exceeds lot capacity',
      });
    if (input.orderId) {
      const order = this.state.orders.get(input.orderId);
      if (!order || BigInt(order.amountMinor) !== amount)
        throw new ConflictException({
          code: 'ORDER_AMOUNT_MISMATCH',
          message: 'Funding event does not match the referenced order amount',
        });
    }
  }

  private validateRelease(amountMinor: string) {
    const funded =
      BigInt(this.state.lot.blocksFunded) *
      BigInt(this.state.lot.blockPriceMinor);
    if (BigInt(this.sum('released')) + BigInt(amountMinor) > funded)
      throw new ConflictException({
        code: 'RELEASE_EXCEEDS_FUNDED',
        message: 'Release event exceeds confirmed funding',
      });
  }

  private validateRefund(input: Omit<ChainEvent, 'id' | 'createdAt'>) {
    const order = input.orderId
      ? this.state.orders.get(input.orderId)
      : undefined;
    if (
      !order ||
      BigInt(input.amountMinor) > BigInt(order.amountMinor) ||
      BigInt(this.sum('refunded', input.orderId)) + BigInt(input.amountMinor) >
        BigInt(order.amountMinor)
    )
      throw new ConflictException({
        code: 'REFUND_EXCEEDS_CONTRIBUTION',
        message: 'Refund event exceeds the order contribution',
      });
  }

  private async applyFunding(event: ChainEvent) {
    const lot = this.state.lot;
    lot.blocksFunded += Number(
      BigInt(event.amountMinor) / BigInt(lot.blockPriceMinor),
    );
    lot.escrowStatus =
      lot.blocksFunded >= lot.totalBlocks ? 'funded' : 'funding';
    if (lot.blocksFunded >= lot.totalBlocks && !lot.goalReachedAt) {
      lot.goalReachedAt = event.createdAt;
      lot.status = 'goal_reached';
    }
    const intent = [...this.state.intents.values()].find(
      (item) => item.txHash === event.txHash,
    );
    if (intent) {
      intent.status = 'confirmed';
      await this.state.saveRecord('intent', intent.id, intent);
    }
    const orderId = event.orderId ?? intent?.orderId;
    const order = orderId ? this.state.orders.get(orderId) : undefined;
    if (order) {
      order.status = 'confirmed';
      await this.state.saveRecord('order', order.id, order);
    }
  }

  private async applyClose(event: ChainEvent) {
    if (event.type !== 'released' && event.type !== 'refunded') return;
    this.state.lot.escrowStatus = event.type;
    this.state.lot.status = 'closed';
    if (event.type === 'refunded' && event.orderId) {
      const claim = this.state.claimPreparations.get(event.orderId);
      if (claim) {
        claim.status = 'refunded';
        await this.state.saveRecord('refund_claim', event.orderId, claim);
      }
    }
  }

  private latestEventDate() {
    return (
      [...this.state.events.values()]
        .map((event) => event.createdAt)
        .sort()
        .at(-1) ?? null
    );
  }
}
