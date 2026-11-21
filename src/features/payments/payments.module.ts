import { DatabaseModule } from '../../database/database.module.js';
import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { PaymentsService } from './payments.service.js';
import { StellarSorobanClient } from './stellar-soroban.client.js';

@Module({
  imports: [OrdersModule, DatabaseModule],
  providers: [PaymentsService, StellarSorobanClient],
  exports: [PaymentsService],
})
export class PaymentsModule {}
