import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarSorobanClient {
  constructor(private readonly config: ConfigService) {}

  assertConfigured(acceptedTermsHash: string) {
    const contractId = this.config.get<string>('STELLAR_ESCROW_CONTRACT_ID');
    const termsHash = this.config.get<string>('STELLAR_TERMS_HASH');
    if (
      !this.config.get<boolean>('STELLAR_ENABLED') ||
      !contractId ||
      !termsHash
    )
      throw new ServiceUnavailableException({
        code: 'STELLAR_INTEGRATION_NOT_CONFIGURED',
        message:
          'Soroban funding is unavailable until a verified Testnet deployment is configured',
      });
    if (termsHash.toLowerCase() !== acceptedTermsHash.toLowerCase())
      throw new ServiceUnavailableException({
        code: 'STELLAR_OFFER_TERMS_MISMATCH',
        message:
          'Soroban funding is unavailable because the configured contract terms do not match the accepted offer',
      });
    // No verified per-offer deployment binding is persisted yet. A manually
    // configured hash and contract ID do not establish that this offer matches
    // the contract's immutable terms, asset, or deployed WASM.
    throw new ServiceUnavailableException({
      code: 'STELLAR_OFFER_NOT_VERIFIED',
      message: 'Soroban funding is unavailable until this offer and its deployment are verified',
    });
  }

  async prepareContribution(input: {
    payer: string;
    orderRef: string;
    blockCount: number;
  }) {
    const enabled = this.config.get<boolean>('STELLAR_ENABLED');
    const contractId = this.config.get<string>('STELLAR_ESCROW_CONTRACT_ID');
    const termsHash = this.config.get<string>('STELLAR_TERMS_HASH');
    const rpcUrl = this.config.get<string>('STELLAR_RPC_URL');
    const passphrase = this.config.get<string>(
      'STELLAR_NETWORK_PASSPHRASE',
    );
    if (!enabled || !contractId || !termsHash || !rpcUrl || !passphrase)
      throw new ServiceUnavailableException({
        code: 'STELLAR_INTEGRATION_NOT_CONFIGURED',
        message: 'Soroban funding is unavailable until a verified Testnet deployment is configured',
      });
    if (!/^[0-9a-f]{64}$/i.test(input.orderRef))
      throw new Error('orderRef must be exactly 32 bytes encoded as hex');

    const server = new rpc.Server(rpcUrl);
    const account = await server.getAccount(input.payer);
    const operation = new Contract(contractId).call(
      'contribute',
      new Address(input.payer).toScVal(),
      xdr.ScVal.scvBytes(Buffer.from(input.orderRef, 'hex')),
      nativeToScVal(input.blockCount, { type: 'u32' }),
      xdr.ScVal.scvBytes(Buffer.from(termsHash, 'hex')),
    );
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: passphrase,
    })
      .addOperation(operation)
      .setTimeout(60)
      .build();
    const simulation = await server.simulateTransaction(transaction);
    if ('error' in simulation || !simulation.result)
      throw new ServiceUnavailableException({
        code: 'SOROBAN_SIMULATION_FAILED',
        message: 'The contribution did not pass Soroban simulation',
      });
    const prepared = rpc.assembleTransaction(transaction, simulation).build();
    return {
      unsignedXdr: prepared.toXDR(),
      txHash: Buffer.from(prepared.hash()).toString('hex'),
      contractId,
      networkPassphrase: passphrase,
      acceptedTermsHash: termsHash,
    };
  }
}
