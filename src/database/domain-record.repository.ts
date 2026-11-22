import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainRecord } from '../domain-record.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DomainRecordRepository {
  constructor(
    @InjectRepository(DomainRecord)
    private readonly records: Repository<DomainRecord>,
  ) {}

  findAll() {
    return this.records.find();
  }

  save(kind: string, recordId: string, payload: object) {
    return this.records.query(`INSERT INTO domain_records (id, kind, record_id, payload)
      VALUES ($1, $2, $3, $4::jsonb)
      ON CONFLICT (kind, record_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
    [randomUUID(), kind, recordId, JSON.stringify(payload)]);
  }

  remove(kind: string, recordId: string) {
    return this.records.delete({ kind, recordId });
  }
}
