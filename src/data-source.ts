import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { validateConfig } from './config.js';
import { DomainRecord } from './domain-record.entity.js';
import { CreateDomainRecords1763680000000 } from './migrations/1763680000000-CreateDomainRecords.js';
import { CreateWalletBindings1763680000001 } from './migrations/1763680000001-CreateWalletBindings.js';
import { CreateIdentity1763680000002 } from './migrations/1763680000002-CreateIdentity.js';

import { PasswordIdentity1763680000003 } from './migrations/1763680000003-PasswordIdentity.js';
import { OfferEscrowBindings1763680000004 } from './migrations/1763680000004-OfferEscrowBindings.js';

const config = validateConfig(process.env);
export default new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [DomainRecord],
  migrations: [CreateDomainRecords1763680000000, CreateWalletBindings1763680000001, CreateIdentity1763680000002, PasswordIdentity1763680000003, OfferEscrowBindings1763680000004],
  synchronize: false,
});
