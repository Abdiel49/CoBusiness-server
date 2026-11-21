import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DemoStateStore } from '../../core/demo-state.store.js';
import { CatalogService } from '../catalog/catalog.service.js';

@Injectable()
export class AuditService {
  constructor(
    private readonly state: DemoStateStore,
    private readonly catalog: CatalogService,
  ) {}

  async record(
    action: string,
    actorId: string,
    detail: Record<string, unknown>,
  ) {
    const entry = {
      id: randomUUID(),
      action,
      actorId,
      detail,
      createdAt: new Date().toISOString(),
    };
    this.state.audit.push(entry);
    await this.state.saveRecord('audit', entry.id, entry);
  }

  summary() {
    return {
      demo: true,
      lot: this.catalog.lotView(),
      actions: this.state.audit,
      syncErrors: this.state.syncErrors,
      discrepancies: [],
      chainEvents: [...this.state.events.values()].map(
        ({ id, txHash, type, amountMinor, ledger }) => ({
          id,
          txHash,
          type,
          amountMinor,
          ledger,
        }),
      ),
    };
  }
}
