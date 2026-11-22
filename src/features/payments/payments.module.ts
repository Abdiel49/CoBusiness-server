import { DatabaseModule } from '../../database/database.module.js';
import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { PaymentsService } from './payments.service.js';
import { StellarSorobanClient } from './stellar-soroban.client.js';
import { StellarAttestationClient } from './stellar-attestation.client.js';

@Module({
  imports: [OrdersModule, DatabaseModule],
  providers: [PaymentsService, StellarSorobanClient, StellarAttestationClient],
  exports: [PaymentsService],
})
export class PaymentsModule {}
