import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Actor, DemoStateStore } from '../../core/demo-state.store.js';
import { IdentityService } from '../identity/identity.service.js';
import { WALLET_PROOF_VERIFIER } from '../../wallet-proof.js';
import type { WalletProofVerifier } from '../../wallet-proof.js';
import { Inject, Optional } from '@nestjs/common';

@Injectable()
export class WalletService {
  constructor(
    private readonly state: DemoStateStore,
    private readonly identity: IdentityService,
    @Optional()
    @Inject(WALLET_PROOF_VERIFIER)
    private readonly verifier?: WalletProofVerifier,
  ) {}

  challenge(actor: Actor) {
    return this.identity.createChallenge(actor);
  }

  async verify(
    actor: Actor,
    input: {
      challengeId: string;
      publicKey: string;
      signature: string;
      network: string;
    },
  ) {
    this.identity.require(actor, 'buyer');
    const challenge = this.state.challenges.get(input.challengeId);
    if (
      !challenge ||
      challenge.userId !== actor.id ||
      challenge.expiresAt < Date.now()
    )
      throw new BadRequestException({
        code: 'WALLET_CHALLENGE_INVALID',
        message:
          'Wallet challenge is missing, expired, or belongs to another user',
      });
    if (input.network !== challenge.network)
      throw new BadRequestException({
        code: 'WALLET_NETWORK_MISMATCH',
        message: 'Wallet network does not match challenge',
      });
    if (!this.verifier)
      throw new BadRequestException({
        code: 'WALLET_PROOF_VERIFIER_UNAVAILABLE',
        message:
          'No Stellar signature verifier is configured; wallet binding is disabled',
      });
    const message = `CoBusiness wallet binding ${challenge.nonce}`;
    if (
      !(await this.verifier.verify({
        publicKey: input.publicKey,
        message,
        signature: input.signature,
        network: input.network,
      }))
    )
      throw new BadRequestException({
        code: 'WALLET_PROOF_INVALID',
        message: 'Wallet proof could not be verified',
      });
    const existingOwner = this.state.walletOwners.get(input.publicKey);
    if (existingOwner && existingOwner !== actor.id)
      throw new ConflictException({
        code: 'WALLET_ALREADY_BOUND',
        message: 'Wallet is already bound to another demo identity',
      });
    this.state.wallets.set(actor.id, input.publicKey);
    this.state.walletOwners.set(input.publicKey, actor.id);
    this.state.challenges.delete(input.challengeId);
    await this.state.saveRecord('wallet', actor.id, {
      publicKey: input.publicKey,
    });
    await this.state.saveRecord('wallet-public-key', input.publicKey, {
      userId: actor.id,
    });
    await this.state.removeRecord('challenge', input.challengeId);
    return {
      publicKey: input.publicKey,
      network: challenge.network,
      verified: true,
    };
  }

  async revoke(actor: Actor) {
    this.identity.require(actor, 'buyer');
    const publicKey = this.state.wallets.get(actor.id);
    if (!publicKey) return { revoked: false };
    this.state.wallets.delete(actor.id);
    this.state.walletOwners.delete(publicKey);
    await this.state.removeRecord('wallet', actor.id);
    await this.state.removeRecord('wallet-public-key', publicKey);
    return { revoked: true };
  }
}
