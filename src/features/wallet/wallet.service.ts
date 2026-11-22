import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { Actor } from '../../core/demo-state.store.js';
import { WalletBindingRepository } from '../../database/wallet-binding.repository.js';
import { IdentityService } from '../identity/identity.service.js';
import { WALLET_PROOF_VERIFIER } from '../../wallet-proof.js';
import type { WalletProofVerifier } from '../../wallet-proof.js';

const network = 'Test SDF Network ; September 2015';
@Injectable()
export class WalletService {
  constructor(private readonly repository: WalletBindingRepository, private readonly identity: IdentityService,
    @Inject(WALLET_PROOF_VERIFIER) private readonly verifier: WalletProofVerifier) {}
  async challenge(actor: Actor) {
    this.identity.require(actor, 'buyer');
    const id = randomUUID(), nonce = randomBytes(24).toString('hex'), expiresAt = new Date(Date.now() + 300000);
    await this.repository.createChallenge({ id, userId: actor.id, nonce, network, expiresAt });
    return { challengeId: id, nonce, network, expiresAt: expiresAt.toISOString(), message: `CoBusiness wallet binding ${nonce}` };
  }
  async verify(actor: Actor, input: { challengeId: string; publicKey: string; signature: string; network: string }) {
    this.identity.require(actor, 'buyer');
    const result = await this.repository.bind({ ...input, userId: actor.id, verify: (nonce) => this.verifier.verify({ ...input, message: `CoBusiness wallet binding ${nonce}` }) });
    if (result === 'owned') throw new ConflictException({ code: 'WALLET_ALREADY_BOUND', message: 'Wallet is already bound to another user' });
    if (result !== 'bound') throw new BadRequestException({ code: result === 'invalid_proof' ? 'WALLET_PROOF_INVALID' : 'WALLET_CHALLENGE_INVALID', message: 'Wallet challenge or proof is invalid' });
    return { publicKey: input.publicKey, network, verified: true };
  }
  async revoke(actor: Actor) { this.identity.require(actor, 'buyer'); return { revoked: await this.repository.revoke(actor.id) }; }
}
