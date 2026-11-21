import { Injectable, NotFoundException } from '@nestjs/common';
import { DemoStateStore } from '../../core/demo-state.store.js';

@Injectable()
export class CatalogService {
  constructor(private readonly state: DemoStateStore) {}

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

  lot(id: string) {
    if (id !== this.state.lot.id)
      throw new NotFoundException({
        code: 'LOT_NOT_FOUND',
        message: 'Lot not found',
      });
    return this.lotView();
  }

  lots() {
    return [this.lotView()];
  }

  lotView() {
    const lot = this.state.lot;
    const reservedBlocks = [...this.state.orders.values()]
      .filter((order) => order.lotId === lot.id)
      .reduce((total, order) => total + order.blockCount, 0);
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
