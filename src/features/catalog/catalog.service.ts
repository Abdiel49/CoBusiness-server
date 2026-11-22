import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { DemoStateStore } from '../../core/demo-state.store.js';
import { OfferEscrowBindingRepository } from '../../database/offer-escrow-binding.repository.js';
import { ReservationRepository } from '../../database/reservation.repository.js';
import { operationalOffer } from '../payments/operational-offer.js';

@Injectable()
export class CatalogService {
  constructor(private readonly state: DemoStateStore, @Optional() private readonly bindings?: OfferEscrowBindingRepository, @Optional() private readonly reservations?: ReservationRepository) {}

  operator(id: string) {
    if (id !== this.state.operator.id)
      throw new NotFoundException({
        code: 'OPERATOR_NOT_FOUND',
        message: 'Operator not found',
      });
    return this.state.operator;
  }

  product(id: string) {
    if (id !== this.state.product.id)
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    return this.state.product;
  }

  async lot(id: string) {
    if (id !== this.state.lot.id) {
      const binding = await this.bindings?.find(id);
      if (binding) return operationalOffer(binding);
    }
    if (id !== this.state.lot.id)
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.lotView();
  }

  async lots() {
    return [await this.lotView(), ...(await this.bindings?.findAll() ?? []).map(operationalOffer)];
  }

  async lotView() {
    const lot = this.state.lot;
    const reservedBlocks = await this.reservations?.reserved(lot.id) ?? 0;
    return {
      ...lot,
      blocksAvailable: Math.max(0, lot.totalBlocks - reservedBlocks),
      percentageFunded: Math.floor((lot.blocksFunded * 100) / lot.totalBlocks),
      confirmedAmountMinor: String(
        BigInt(lot.blocksFunded) * BigInt(lot.blockPriceMinor),
      ),
    };
  }
}
