import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { validateConfig } from './config.js';
import { DomainRecord } from './domain-record.entity.js';
import { CreateDomainRecords1763680000000 } from './migrations/1763680000000-CreateDomainRecords.js';

const config = validateConfig(process.env);
export default new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [DomainRecord],
  migrations: [CreateDomainRecords1763680000000],
  synchronize: false,
});
