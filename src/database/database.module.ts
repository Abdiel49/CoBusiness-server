import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainRecord } from '../domain-record.entity.js';
import { DomainRecordRepository } from './domain-record.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([DomainRecord])],
  providers: [DomainRecordRepository],
  exports: [DomainRecordRepository],
})
export class DatabaseModule {}
