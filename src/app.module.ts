import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import { ApiEnvelopeInterceptor } from './api.js';
import { DomainRecord } from './domain-record.entity.js';
import { HealthController } from './health.controller.js';
import { MvpController } from './mvp.controller.js';
import { validateConfig } from './config.js';
import { StateModule } from './core/state.module.js';
import { IdentityModule } from './features/identity/identity.module.js';
import { CatalogModule } from './features/catalog/catalog.module.js';
import { OrdersModule } from './features/orders/orders.module.js';
import { WalletModule } from './features/wallet/wallet.module.js';
import { PaymentsModule } from './features/payments/payments.module.js';
import { AuditModule } from './features/audit/audit.module.js';
import { IndexerModule } from './features/indexer/indexer.module.js';
import { ApprovalsModule } from './features/approvals/approvals.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD') ?? '',
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [DomainRecord],
        migrations: [import.meta.dirname + '/migrations/*.js'],
        synchronize: false,
        migrationsRun: false,
        retryAttempts: 3,
      }),
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'cobusiness-server',
    }),
    StateModule,
    IdentityModule,
    CatalogModule,
    OrdersModule,
    WalletModule,
    PaymentsModule,
    AuditModule,
    IndexerModule,
    ApprovalsModule,
  ],
  controllers: [MvpController, HealthController],
  providers: [ApiEnvelopeInterceptor],
})
export class AppModule {}
