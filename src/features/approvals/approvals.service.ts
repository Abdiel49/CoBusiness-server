import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Actor, DemoStateStore } from '../../core/demo-state.store.js';
import { AuditService } from '../audit/audit.service.js';
import { IndexerService } from '../indexer/indexer.service.js';
import { OrdersService } from '../orders/orders.service.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly state: DemoStateStore,
    private readonly indexer: IndexerService,
    private readonly orders: OrdersService,
    private readonly audit: AuditService,
  ) {}

  async respond(actor: Actor, decision: 'continue' | 'decline') {
    this.require(actor, 'operator');
    const lot = this.state.lot;
    if (!lot.goalReachedAt)
      throw new ConflictException({
        code: 'LOT_GOAL_NOT_REACHED',
        message: 'Lot goal has not been reached',
      });
    if (Date.now() > Date.parse(lot.goalReachedAt) + 24 * 3600_000)
      throw new ConflictException({
        code: 'RESPONSE_WINDOW_CLOSED',
        message: 'Operator response window has closed',
      });
    lot.operatorResponse = {
      decision,
      source: 'simulated operator demo',
      respondedAt: new Date().toISOString(),
    };
    await this.state.saveRecord('lot', lot.id, lot);
    await this.audit.record('operator.response', actor.id, {
      lotId: lot.id,
      decision,
    });
    return lot.operatorResponse;
  }

  async prepareRelease(actor: Actor) {
    this.require(actor, 'cobusiness');
    const lot = this.state.lot;
    if (!lot.goalReachedAt || lot.operatorResponse?.decision !== 'continue')
      throw new ConflictException({
        code: 'RELEASE_NOT_ELIGIBLE',
        message: 'Goal and operator confirmation are required',
      });
    const authorization = {
      status: 'prepared',
      signed: false,
      method: 'authorize_release',
      cause: 'goal_reached_and_operator_confirmed',
      contractId: 'UNCONFIGURED',
      termsHash: lot.termsHash,
      amountMinor: String(
        BigInt(lot.blocksFunded) * BigInt(lot.blockPriceMinor),
      ),
    };
    lot.releaseAuthorization = authorization;
    await this.state.saveRecord('lot', lot.id, lot);
    await this.audit.record('release.authorization.prepared', actor.id, {
      lotId: lot.id,
    });
    return authorization;
  }

  async prepareRefundEnablement(actor: Actor) {
    this.require(actor, 'cobusiness');
    const lot = this.state.lot;
    if (
      Date.now() < Date.parse(lot.fundingDeadline) &&
      lot.operatorResponse?.decision !== 'decline'
    )
      throw new ConflictException({
        code: 'REFUND_NOT_ELIGIBLE',
        message: 'Selected refund cause is not eligible yet',
      });
    const result = {
      eligible: true,
      enabled: lot.refundEnabled,
      status: lot.refundEnabled ? 'enabled' : 'prepared',
      method: 'enable_refunds',
      signed: false,
      cause:
        lot.operatorResponse?.decision === 'decline'
          ? 'operator_declined'
          : 'funding_deadline_missed',
      contractId: 'UNCONFIGURED',
    };
    await this.audit.record('refund.enablement.prepared', actor.id, {
      lotId: lot.id,
      cause: result.cause,
    });
    return result;
  }

  async prepareClaim(actor: Actor, orderId: string) {
    this.require(actor, 'buyer');
    const receipt = this.orders.get(actor, orderId);
    const lot = this.state.lot;
    if (!lot.refundEnabled)
      throw new ConflictException({
        code: 'REFUND_NOT_ENABLED',
        message: 'CoBusiness has not enabled refunds on-chain',
      });
    if (this.indexer.sum('refunded', orderId) !== '0')
      throw new ConflictException({
        code: 'REFUND_ALREADY_CONFIRMED',
        message: 'Order contribution has already been refunded',
      });
    const existing = this.state.claimPreparations.get(orderId);
    if (existing) return existing;
    const claim = {
      claimId: randomUUID(),
      orderId,
      amountMinor: receipt.amountMinor,
      asset: this.state.product.asset.code,
      eligible: true,
      enabled: true,
      status: 'prepared',
      signed: false,
      method: 'claim_refund',
      contractId: 'UNCONFIGURED',
    };
    this.state.claimPreparations.set(orderId, claim);
    await this.state.saveRecord('refund_claim', orderId, claim);
    await this.audit.record('refund.claim.prepared', actor.id, { orderId });
    return claim;
  }

  executionDocument() {
    const release = [...this.state.events.values()].find(
      (event) => event.type === 'released' && event.lotId === this.state.lot.id,
    );
    if (!release)
      throw new NotFoundException({
        code: 'EXECUTION_NOT_CONFIRMED',
        message: 'No confirmed release event is available',
      });
    return {
      demo: true,
      legalValidity: false,
      physicalDeliveryConfirmed: false,
      lotId: this.state.lot.id,
      termsVersion: this.state.lot.termsVersion,
      termsHash: this.state.lot.termsHash,
      orders: [...this.state.orders.values()]
        .filter((order) => order.status === 'confirmed')
        .map(({ id, units, amountMinor }) => ({ id, units, amountMinor })),
      releaseTransaction: release.txHash,
      releasedAmountMinor: release.amountMinor,
      confirmedAt: release.createdAt,
    };
  }

  private require(actor: Actor, role: 'operator' | 'cobusiness' | 'buyer') {
    if (actor.role !== role)
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'This demo identity cannot perform this action',
      });
  }
}
