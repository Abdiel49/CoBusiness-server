import { DatabaseModule } from '../../database/database.module.js';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { RealAuthService } from './real-auth.service.js';
import { SessionAuthGuard } from '../../session-auth.guard.js';
import { IdentityService } from './identity.service.js';

@Module({ imports: [DatabaseModule], controllers: [AuthController], providers: [IdentityService, RealAuthService, SessionAuthGuard], exports: [IdentityService, RealAuthService, SessionAuthGuard] })
export class IdentityModule {}
