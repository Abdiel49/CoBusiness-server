import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import {
  UnavailableWalletProofVerifier,
  WALLET_PROOF_VERIFIER,
} from '../../wallet-proof.js';
import { WalletService } from './wallet.service.js';

@Module({
  imports: [IdentityModule],
  providers: [
    WalletService,
    {
      provide: WALLET_PROOF_VERIFIER,
      useClass: UnavailableWalletProofVerifier,
    },
  ],
  exports: [WalletService],
})
export class WalletModule {}
