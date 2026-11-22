import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({ imports: [DatabaseModule], providers: [CatalogService], exports: [CatalogService] })
export class CatalogModule {}
