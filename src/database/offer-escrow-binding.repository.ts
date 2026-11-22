import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type OfferEscrowBinding = {
  offerId: string;
  contractId: string;
  network: string;
  asset: string;
  termsHash: string;
  wasmHash: string;
  termsXdr: Buffer;
};

/** Storage only: callers must independently verify RPC evidence before use. */
@Injectable()
export class OfferEscrowBindingRepository {
  constructor(private readonly db: DataSource) {}

  async insert(binding: OfferEscrowBinding): Promise<void> {
    await this.db.query(`INSERT INTO offer_escrow_bindings
      (offer_id, contract_id, network, asset, terms_hash, wasm_hash, terms_xdr)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`, [binding.offerId, binding.contractId,
      binding.network, binding.asset, binding.termsHash, binding.wasmHash, binding.termsXdr]);
  }

  async find(offerId: string): Promise<OfferEscrowBinding | null> {
    const rows: OfferEscrowBinding[] = await this.db.query(`SELECT offer_id AS "offerId",
      contract_id AS "contractId", network, asset, terms_hash AS "termsHash",
      wasm_hash AS "wasmHash", terms_xdr AS "termsXdr"
      FROM offer_escrow_bindings WHERE offer_id = $1`, [offerId]);
    return rows[0] ?? null;
  }

  async findAll(): Promise<OfferEscrowBinding[]> {
    return this.db.query(`SELECT offer_id AS "offerId", contract_id AS "contractId", network, asset,
      terms_hash AS "termsHash", wasm_hash AS "wasmHash", terms_xdr AS "termsXdr"
      FROM offer_escrow_bindings ORDER BY offer_id`);
  }
}
