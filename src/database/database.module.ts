import { ReservationRepository } from './reservation.repository.js';
import { WalletBindingRepository } from './wallet-binding.repository.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainRecord } from '../domain-record.entity.js';
import { DomainRecordRepository } from './domain-record.repository.js';
import { OfferEscrowBindingRepository } from './offer-escrow-binding.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([DomainRecord])],
  providers: [ReservationRepository, DomainRecordRepository, WalletBindingRepository, OfferEscrowBindingRepository],
  exports: [ReservationRepository, DomainRecordRepository, WalletBindingRepository, OfferEscrowBindingRepository],
})
export class DatabaseModule {}
