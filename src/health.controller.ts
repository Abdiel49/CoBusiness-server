import {
  Controller,
  Get,
  Inject,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Optional()
    @Inject(getDataSourceToken())
    private readonly dataSource?: DataSource,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  health() {
    return { status: 'ok', service: 'cobusiness-server' };
  }
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async readiness() {
    try {
      if (!this.dataSource?.isInitialized)
        throw new Error('Database unavailable');
      await this.dataSource.query('SELECT 1');
      return { status: 'ready', database: 'connected', mode: 'demo' };
    } catch {
      throw new ServiceUnavailableException({
        code: 'NOT_READY',
        message: 'Database is unavailable',
      });
    }
  }
}
