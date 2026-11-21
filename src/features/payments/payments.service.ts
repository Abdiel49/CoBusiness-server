import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Actor, DemoStateStore, Intent } from '../../core/demo-state.store.js';
import { OrdersService } from '../orders/orders.service.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly state: DemoStateStore,
    private readonly orders: OrdersService,
  ) {}

  async prepare(actor: Actor, orderId: string) {
    const order = this.orders.get(actor, orderId);
    if (!this.state.wallets.has(actor.id))
      throw new ConflictException({
        code: 'WALLET_REQUIRED',
        message: 'Verified Testnet wallet required',
      });
    const existing = [...this.state.intents.values()].find(
      (intent) => intent.orderId === orderId && intent.status !== 'failed',
    );
    if (existing) return this.withInvocation(existing, order);
    const intent: Intent = {
      id: randomUUID(),
      orderId,
      status: 'prepared',
      amountMinor: order.amountMinor,
      createdAt: new Date().toISOString(),
    };
    this.state.intents.set(intent.id, intent);
    await this.state.saveRecord('intent', intent.id, intent);
    return this.withInvocation(intent, order);
  }

  private withInvocation(
    intent: Intent,
    order: ReturnType<OrdersService['get']>,
  ) {
    return {
      ...intent,
      invocation: {
        method: 'fund',
        signed: false,
        contractId: 'UNCONFIGURED',
        params: {
          lotId: order.lotId,
          orderId: order.id,
          amountMinor: order.amountMinor,
          termsHash: order.termsHash,
        },
      },
    };
  }

  async submit(actor: Actor, id: string, txHash: string) {
    const intent = this.state.intents.get(id);
    if (!intent)
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment intent not found',
      });
    const order = this.state.orders.get(intent.orderId)!;
    if (actor.id !== order.buyerId)
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied',
      });
    if (intent.txHash) {
      if (intent.txHash !== txHash)
        throw new ConflictException({
          code: 'PAYMENT_ALREADY_SUBMITTED',
          message: 'Payment intent already has a transaction reference',
        });
      return { ...intent, funded: intent.status === 'confirmed' };
    }
    intent.txHash = txHash;
    intent.status = 'submitted';
    await this.state.saveRecord('intent', id, intent);
    return { ...intent, funded: false };
  }

  get(actor: Actor, id: string) {
    const intent = this.state.intents.get(id);
    if (!intent)
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment intent not found',
      });
    const order = this.state.orders.get(intent.orderId)!;
    if (
      actor.id !== order.buyerId &&
      !['admin', 'operator', 'cobusiness'].includes(actor.role)
    )
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied',
      });
    return { ...intent, funded: intent.status === 'confirmed' };
  }
}
