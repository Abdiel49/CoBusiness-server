import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { WalletBindingRepository } from '../../database/wallet-binding.repository.js';
import {
  Actor,
  DemoRole,
} from '../../core/demo-state.store.js';

@Injectable()
export class IdentityService {
  constructor(private readonly wallets: WalletBindingRepository) {}

  async me(actor: Actor) {
    return { ...actor, wallet: await this.wallets.find(actor.id) };
  }

  require(actor: Actor, role: DemoRole) {
    if (actor.role !== role)
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'This identity cannot perform this action',
      });
  }
}
