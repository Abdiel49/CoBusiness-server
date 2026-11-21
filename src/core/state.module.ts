import { Global, Module } from '@nestjs/common';
import { DemoStateStore } from './demo-state.store.js';
import { DatabaseModule } from '../database/database.module.js';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [DemoStateStore],
  exports: [DemoStateStore],
})
export class StateModule {}
