import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { AuditService } from './audit.service.js';

@Module({
  imports: [CatalogModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
