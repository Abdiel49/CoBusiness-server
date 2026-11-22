import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({ imports: [DatabaseModule], providers: [OrdersService], exports: [OrdersService] })
export class OrdersModule {}
