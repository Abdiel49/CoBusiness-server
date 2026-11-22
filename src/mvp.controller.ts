import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Req,
  Param,
  Post,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiHeader,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  IsBoolean,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';
import { timingSafeEqual } from 'node:crypto';
import { SessionAuthGuard } from './session-auth.guard.js';
import type { AuthenticatedRequest } from './session-auth.guard.js';
import { IdentityService } from './features/identity/identity.service.js';
import { CatalogService } from './features/catalog/catalog.service.js';
import { OrdersService } from './features/orders/orders.service.js';
import { WalletService } from './features/wallet/wallet.service.js';
import { PaymentsService } from './features/payments/payments.service.js';
import { IndexerService } from './features/indexer/indexer.service.js';
import { ApprovalsService } from './features/approvals/approvals.service.js';
import { AuditService } from './features/audit/audit.service.js';

export class CreateOrderDto {
  @ApiProperty({ minimum: 1, example: 2 }) @IsInt() @Min(1) blockCount!: number;
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) acceptedTermsVersion!: number;
  @ApiProperty({ example: 'checkout-0001' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}
export class WalletVerifyDto {
  @ApiProperty({ example: '194bb173-d304-4694-8474-a82a19af4daf' }) @IsUUID() challengeId!: string;
  @ApiProperty({ description: 'Stellar G-address' }) @IsString() @Matches(/^G[A-Z2-7]{55}$/) publicKey!: string;
  @ApiProperty({ description: 'SEP-53 signature, canonical base64' }) @IsString() @Matches(/^[A-Za-z0-9+/]{86}==$/) signature!: string;
  @ApiProperty({ example: 'Test SDF Network ; September 2015' })
  @IsString()
  network!: string;
}
export class SubmitPaymentDto {
  @ApiProperty({ example: 'testnet-tx-reference' })
  @IsString()
  @IsNotEmpty()
  txHash!: string;
}
export class OperatorResponseDto {
  @ApiProperty({ enum: ['continue', 'decline'] })
  @IsIn(['continue', 'decline'])
  decision!: 'continue' | 'decline';
}
export class ChainEventDto {
  @ApiProperty() @IsString() network!: string;
  @ApiProperty() @IsString() contractId!: string;
  @ApiProperty({ enum: ['funded', 'released', 'refund_enabled', 'refunded'] })
  @IsIn(['funded', 'released', 'refund_enabled', 'refunded'])
  type!: 'funded' | 'released' | 'refund_enabled' | 'refunded';
  @ApiProperty() @IsString() lotId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() orderId?: string;
  @ApiProperty({ example: '12500000' }) @IsString() amountMinor!: string;
  @ApiProperty() @IsString() txHash!: string;
  @ApiProperty() @IsInt() @Min(1) ledger!: number;
  @ApiProperty() @IsBoolean() confirmed!: boolean;
}

@ApiTags('MVP v1')
@Controller()
export class MvpController {
  constructor(
    private readonly identity: IdentityService,
    private readonly catalog: CatalogService,
    private readonly orders: OrdersService,
    private readonly wallet: WalletService,
    private readonly payments: PaymentsService,
    private readonly indexer: IndexerService,
    private readonly approvals: ApprovalsService,
    private readonly auditService: AuditService,
  ) {}

  @Get('me') @UseGuards(SessionAuthGuard) @ApiCookieAuth('__Host-cobusiness_session') me(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.identity.me(request.actor);
  }
  @Get('operators/:id') operator(@Param('id') id: string) {
    return this.catalog.operator(id);
  }
  @Get('products/:id') product(@Param('id') id: string) {
    return this.catalog.product(id);
  }
  @Get('lots') lots() {
    return this.catalog.lots();
  }
  @Get('lots/:id') lot(@Param('id') id: string) {
    return this.catalog.lot(id);
  }
  @ApiOperation({ summary: 'Reserve blocks; no payment is collected' })
  @Post('lots/:id/orders')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  @ApiHeader({ name: 'Idempotency-Key', required: false })
  @ApiResponse({
    status: 201,
    description: 'Pending whole-block order and individual receipt',
    schema: {
      example: {
        data: {
          id: 'c1b0c5b8-9f5a-4d2c-9f91-53dc98ccf00a',
          blockCount: 2,
          units: 20,
          amountMinor: '25000000',
          termsVersion: 1,
          status: 'pending',
          receipt: {
            id: 'receipt-c1b0c5b8-9f5a-4d2c-9f91-53dc98ccf00a',
            paymentStatus: 'pending',
          },
        },
        meta: { apiVersion: 'v1', timestamp: '2026-11-21T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Stale terms, reused key, closed funding, or lot capacity conflict',
    schema: {
      example: {
        error: {
          code: 'TERMS_VERSION_MISMATCH',
          message: 'Accepted terms are no longer current',
          traceId: 'c6b9d81b-aad3-4e72-9f97-6243fc45ef11',
        },
        meta: { apiVersion: 'v1', timestamp: '2026-11-21T00:00:00.000Z' },
      },
    },
  })
  createOrder(
    @Param('id') id: string,
    @Body() body: CreateOrderDto,
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') key?: string,
  ) {
    return this.orders.create(request.actor, {
      lotId: id,
      blockCount: body.blockCount,
      acceptedTermsVersion: body.acceptedTermsVersion,
      idempotencyKey: key ?? body.idempotencyKey,
    });
  }
  @Get('orders/:id') @UseGuards(SessionAuthGuard) @ApiCookieAuth('__Host-cobusiness_session') order(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.orders.get(request.actor, id);
  }
  @ApiOperation({ summary: 'Create a one-time Testnet wallet challenge' })
  @Post('wallet/challenge')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  challenge(@Req() request: AuthenticatedRequest) {
    return this.wallet.challenge(request.actor);
  }
  @ApiOperation({ summary: 'Verify and bind a Stellar wallet' })
  @Post('wallet/verify') @UseGuards(SessionAuthGuard) @ApiCookieAuth('__Host-cobusiness_session') verify(
    @Body() body: WalletVerifyDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.wallet.verify(request.actor, body);
  }
  @ApiOperation({ summary: 'Revoke the current wallet binding' })
  @Delete('wallet') @UseGuards(SessionAuthGuard) @ApiCookieAuth('__Host-cobusiness_session') revokeWallet(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.wallet.revoke(request.actor);
  }
  @Post('orders/:id/payment-intents')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  intent(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.payments.prepare(request.actor, id);
  }
  @Post('payments/:id/submission')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  submit(
    @Param('id') id: string,
    @Body() body: SubmitPaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.payments.submit(request.actor, id, body.txHash);
  }
  @Get('payments/:id') @UseGuards(SessionAuthGuard) @ApiCookieAuth('__Host-cobusiness_session') payment(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.payments.get(request.actor, id);
  }
  @Get('lots/:id/escrow') escrow(@Param('id') id: string) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.indexer.escrow();
  }
  @Get('lots/:id/execution-document') executionDocument(
    @Param('id') id: string,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.executionDocument();
  }
  @Post('indexer/events')
  @ApiHeader({ name: 'x-indexer-token', required: true })
  event(
    @Body() body: ChainEventDto,
    @Headers('x-indexer-token') token: string,
  ) {
    const configured = process.env.INDEXER_FIXTURE_TOKEN;
    const providedBytes = Buffer.from(token ?? '');
    const configuredBytes = Buffer.from(configured ?? '');
    if (
      !configured ||
      !token ||
      providedBytes.length !== configuredBytes.length ||
      !timingSafeEqual(providedBytes, configuredBytes)
    )
      throw new UnauthorizedException({
        code: 'INDEXER_AUTH_REQUIRED',
        message: 'Indexer fixture authentication is required',
      });
    return this.indexer.ingest(body);
  }
  @Post('lots/:id/operator-response')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  operatorResponse(
    @Param('id') id: string,
    @Body() body: OperatorResponseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.respond(request.actor, body.decision);
  }
  @Post('lots/:id/release-authorization')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  release(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.prepareRelease(request.actor);
  }
  @Post('lots/:id/refund-enablement')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  refundEnablement(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.prepareRefundEnablement(request.actor);
  }
  @Post('orders/:id/refund-claims')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth('__Host-cobusiness_session')
  claim(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.approvals.prepareClaim(request.actor, id);
  }
  @Get('admin/audit') @UseGuards(SessionAuthGuard) @ApiCookieAuth('__Host-cobusiness_session') audit(
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.actor.role !== 'admin')
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Admin role required',
      });
    return this.auditService.summary();
  }

}
