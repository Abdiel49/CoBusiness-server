import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { IndexerModule } from '../indexer/indexer.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { ApprovalsService } from './approvals.service.js';

@Module({
  imports: [AuditModule, IndexerModule, OrdersModule],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
