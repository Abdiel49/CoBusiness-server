import { DatabaseModule } from '../../database/database.module.js';
import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import {
  StellarWalletProofVerifier,
  WALLET_PROOF_VERIFIER,
} from '../../wallet-proof.js';
import { WalletService } from './wallet.service.js';

@Module({
  imports: [IdentityModule, DatabaseModule],
  providers: [
    WalletService,
    {
      provide: WALLET_PROOF_VERIFIER,
      useClass: StellarWalletProofVerifier,
    },
  ],
  exports: [WalletService],
})
export class WalletModule {}
