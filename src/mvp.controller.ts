import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
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
} from 'class-validator';
import { timingSafeEqual } from 'node:crypto';
import { Actor, DemoRole } from './core/demo-state.store.js';
import { DemoAuthGuard } from './security.js';
import { IdentityService } from './features/identity/identity.service.js';
import { CatalogService } from './features/catalog/catalog.service.js';
import { OrdersService } from './features/orders/orders.service.js';
import { WalletService } from './features/wallet/wallet.service.js';
import { PaymentsService } from './features/payments/payments.service.js';
import { IndexerService } from './features/indexer/indexer.service.js';
import { ApprovalsService } from './features/approvals/approvals.service.js';
import { AuditService } from './features/audit/audit.service.js';

export class DemoSessionDto {
  @ApiProperty({
    enum: ['buyer-demo', 'operator-demo', 'cobusiness-demo', 'admin-demo'],
  })
  @IsString()
  userId!: string;
}
export class CreateOrderDto {
  @ApiProperty({ minimum: 1, example: 2 }) @IsInt() @Min(1) blockCount!: number;
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) acceptedTermsVersion!: number;
  @ApiProperty({ example: 'checkout-0001' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}
export class WalletVerifyDto {
  @ApiProperty() @IsString() challengeId!: string;
  @ApiProperty() @IsString() publicKey!: string;
  @ApiProperty() @IsString() signature!: string;
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

  @Post('auth/demo-session')
  @ApiOperation({ summary: 'Start a fictional demo session' })
  @ApiResponse({
    status: 200,
    description: 'Fictional bearer token for local demo use',
    schema: {
      example: {
        data: {
          accessToken: 'demo:buyer-demo:buyer',
          actor: { id: 'buyer-demo', role: 'buyer' },
        },
        meta: { apiVersion: 'v1', timestamp: '2026-11-21T00:00:00.000Z' },
      },
    },
  })
  login(@Body() body: DemoSessionDto) {
    return this.identity.login(body.userId);
  }

  @Get('me') @UseGuards(DemoAuthGuard) @ApiBearerAuth() me(
    @Headers('authorization') authorization: string,
  ) {
    return this.identity.me(this.actor(authorization));
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
  @Post('lots/:id/orders')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
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
    @Headers('authorization') authorization: string,
    @Headers('idempotency-key') key?: string,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.orders.create(this.actor(authorization), {
      blockCount: body.blockCount,
      acceptedTermsVersion: body.acceptedTermsVersion,
      idempotencyKey: key ?? body.idempotencyKey,
    });
  }
  @Get('orders/:id') @UseGuards(DemoAuthGuard) @ApiBearerAuth() order(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.orders.get(this.actor(authorization), id);
  }
  @Post('wallet/challenge')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  challenge(@Headers('authorization') authorization: string) {
    return this.wallet.challenge(this.actor(authorization));
  }
  @Post('wallet/verify') @UseGuards(DemoAuthGuard) @ApiBearerAuth() verify(
    @Body() body: WalletVerifyDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.wallet.verify(this.actor(authorization), body);
  }
  @Delete('wallet') @UseGuards(DemoAuthGuard) @ApiBearerAuth() revokeWallet(
    @Headers('authorization') authorization: string,
  ) {
    return this.wallet.revoke(this.actor(authorization));
  }
  @Post('orders/:id/payment-intents')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  intent(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.payments.prepare(this.actor(authorization), id);
  }
  @Post('payments/:id/submission')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  submit(
    @Param('id') id: string,
    @Body() body: SubmitPaymentDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.payments.submit(this.actor(authorization), id, body.txHash);
  }
  @Get('payments/:id') @UseGuards(DemoAuthGuard) @ApiBearerAuth() payment(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.payments.get(this.actor(authorization), id);
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
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  operatorResponse(
    @Param('id') id: string,
    @Body() body: OperatorResponseDto,
    @Headers('authorization') authorization: string,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.respond(this.actor(authorization), body.decision);
  }
  @Post('lots/:id/release-authorization')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  release(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.prepareRelease(this.actor(authorization));
  }
  @Post('lots/:id/refund-enablement')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  refundEnablement(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (id !== 'lot-demo-001')
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.approvals.prepareRefundEnablement(this.actor(authorization));
  }
  @Post('orders/:id/refund-claims')
  @UseGuards(DemoAuthGuard)
  @ApiBearerAuth()
  claim(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.approvals.prepareClaim(this.actor(authorization), id);
  }
  @Get('admin/audit') @UseGuards(DemoAuthGuard) @ApiBearerAuth() audit(
    @Headers('authorization') authorization: string,
  ) {
    if (this.actor(authorization).role !== 'admin')
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Admin role required',
      });
    return this.auditService.summary();
  }

  private actor(authorization?: string): Actor {
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    const [, id, role] = token.split(':');
    return { id, role: role as DemoRole };
  }
}
