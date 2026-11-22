export type AppConfig = {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  NODE_ENV: string;
  STELLAR_ENABLED: boolean;
  STELLAR_RPC_URL: string;
  STELLAR_NETWORK_PASSPHRASE: string;
};

const stringValue = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback;

export function validateConfig(env: Record<string, unknown>): AppConfig {
  const port = Number(env.PORT ?? 3000);
  const dbPort = Number(env.DB_PORT ?? 5432);
  const config: AppConfig = {
    PORT: port,
    DB_HOST: stringValue(env.DB_HOST, 'localhost'),
    DB_PORT: dbPort,
    DB_USER: stringValue(env.DB_USER, 'cobusiness'),
    DB_PASSWORD: stringValue(env.DB_PASSWORD, ''),
    DB_NAME: stringValue(env.DB_NAME, 'cobusiness'),
    NODE_ENV: stringValue(env.NODE_ENV, 'development'),
    STELLAR_ENABLED: env.STELLAR_ENABLED === 'true',
    STELLAR_RPC_URL: stringValue(
      env.STELLAR_RPC_URL,
      'https://soroban-testnet.stellar.org',
    ),
    STELLAR_NETWORK_PASSPHRASE: stringValue(
      env.STELLAR_NETWORK_PASSPHRASE,
      'Test SDF Network ; September 2015',
    ),
  };
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be a valid TCP port');
  if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535)
    throw new Error('DB_PORT must be a valid TCP port');
  if (!config.DB_PASSWORD && config.NODE_ENV === 'production')
    throw new Error('DB_PASSWORD is required in production');
  if (config.STELLAR_ENABLED) {
    if (config.STELLAR_NETWORK_PASSPHRASE !== 'Test SDF Network ; September 2015')
      throw new Error('This release supports Stellar Testnet only');
  }
  return config;
}
