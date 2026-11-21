import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  Optional,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { StellarSorobanClient } from './stellar-soroban.client.js';
import { Actor, DemoStateStore, Intent } from '../../core/demo-state.store.js';
import { WalletBindingRepository } from '../../database/wallet-binding.repository.js';
import { OrdersService } from '../orders/orders.service.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly state: DemoStateStore,
    private readonly orders: OrdersService,
    @Optional() private readonly stellar?: StellarSorobanClient,
    @Optional() private readonly wallets?: WalletBindingRepository,
  ) {}

  async prepare(actor: Actor, orderId: string) {
    const order = this.orders.get(actor, orderId);
    if (!this.stellar)
      throw new ServiceUnavailableException({
        code: 'STELLAR_INTEGRATION_NOT_CONFIGURED',
        message:
          'Soroban funding is unavailable until a verified Testnet deployment is configured',
      });
    this.stellar.assertConfigured(order.termsHash);
    if (!await this.wallets?.find(actor.id))
      throw new ConflictException({
        code: 'WALLET_REQUIRED',
        message: 'Verified Testnet wallet required',
      });
    const existing = [...this.state.intents.values()].find(
      (intent) => intent.orderId === orderId && intent.status !== 'failed',
    );
    if (existing) return this.withInvocation(existing, order, actor);
    const intent: Intent = {
      id: randomUUID(),
      orderId,
      status: 'prepared',
      amountMinor: order.amountMinor,
      orderRef: randomBytes(32).toString('hex'),
      createdAt: new Date().toISOString(),
    };
    this.state.intents.set(intent.id, intent);
    await this.state.saveRecord('intent', intent.id, intent);
    return this.withInvocation(intent, order, actor);
  }

  private async withInvocation(
    intent: Intent,
    order: ReturnType<OrdersService['get']>,
    actor: Actor,
  ) {
    const payer = await this.wallets?.find(actor.id);
    if (!this.stellar || !payer)
      throw new ServiceUnavailableException({
        code: 'STELLAR_INTEGRATION_NOT_CONFIGURED',
        message: 'Soroban funding is unavailable until a verified Testnet deployment is configured',
      });
    if (!intent.preparedXdr) {
      const prepared = await this.stellar.prepareContribution({
        payer: payer,
        orderRef: intent.orderRef,
        blockCount: order.blockCount,
      });
      intent.preparedXdr = prepared.unsignedXdr;
      intent.preparedTxHash = prepared.txHash;
      intent.contractId = prepared.contractId;
      intent.networkPassphrase = prepared.networkPassphrase;
      intent.acceptedTermsHash = prepared.acceptedTermsHash;
      await this.state.saveRecord('intent', intent.id, intent);
    }
    return {
      ...intent,
      unsignedXdr: intent.preparedXdr,
      txHash: intent.preparedTxHash,
      contractId: intent.contractId,
      networkPassphrase: intent.networkPassphrase,
      acceptedTermsHash: intent.acceptedTermsHash,
      invocation: {
        method: 'contribute',
        signed: false,
        contractId: intent.contractId,
        params: {
          payer: payer,
          orderRef: intent.orderRef,
          blockCount: order.blockCount,
          acceptedTermsHash: intent.acceptedTermsHash,
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
    if (intent.preparedTxHash && intent.preparedTxHash !== txHash)
      throw new ConflictException({
        code: 'PAYMENT_HASH_MISMATCH',
        message: 'Submitted transaction hash does not match the prepared Soroban transaction',
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
