import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { PaymentsService } from './payments.service.js';

@Module({
  imports: [OrdersModule],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
