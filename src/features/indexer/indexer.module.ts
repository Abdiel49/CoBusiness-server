import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { IndexerService } from './indexer.service.js';

@Module({
  imports: [AuditModule],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class IndexerModule {}
