import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import {
  DemoStateStore,
  Actor,
  DemoRole,
} from '../../core/demo-state.store.js';

@Injectable()
export class IdentityService {
  constructor(private readonly state: DemoStateStore) {}

  login(userId: string): { accessToken: string; actor: Actor } {
    const roles: Record<string, DemoRole> = {
      'buyer-demo': 'buyer',
      'operator-demo': 'operator',
      'cobusiness-demo': 'cobusiness',
      'admin-demo': 'admin',
    };
    const role = roles[userId];
    if (!role)
      throw new NotFoundException({
        code: 'DEMO_IDENTITY_NOT_FOUND',
        message: 'Demo identity not found',
      });
    return {
      accessToken: `demo:${userId}:${role}`,
      actor: { id: userId, role },
    };
  }

  me(actor: Actor) {
    return {
      ...actor,
      kyc: { status: 'verified', mode: 'simulated', documentsCollected: false },
      wallet: this.state.wallets.get(actor.id) ?? null,
    };
  }

  async createChallenge(actor: Actor) {
    this.require(actor, 'buyer');
    const id = randomUUID();
    const nonce = randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 5 * 60_000;
    const challenge = {
      userId: actor.id,
      nonce,
      expiresAt,
      network: 'Test SDF Network ; September 2015',
    };
    this.state.challenges.set(id, challenge);
    await this.state.saveRecord('challenge', id, challenge);
    return {
      challengeId: id,
      nonce,
      network: challenge.network,
      expiresAt: new Date(expiresAt).toISOString(),
      message: `CoBusiness wallet binding ${nonce}`,
    };
  }

  require(actor: Actor, role: DemoRole) {
    if (actor.role !== role)
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'This demo identity cannot perform this action',
      });
  }
}
