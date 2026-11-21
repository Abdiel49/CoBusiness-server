import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainRecord } from '../domain-record.entity.js';

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
    return this.records.upsert({ kind, recordId, payload }, [
      'kind',
      'recordId',
    ]);
  }

  remove(kind: string, recordId: string) {
    return this.records.delete({ kind, recordId });
  }
}
