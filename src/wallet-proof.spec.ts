import { createHash } from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { StellarWalletProofVerifier } from './wallet-proof.js';

it('verifies SEP-53 signatures and rejects modified proofs', async () => {
  const key = Keypair.random();
  const message = 'CoBusiness wallet binding example';
  const digest = createHash('sha256').update('Stellar Signed Message:\n').update(message).digest();
  const proof = { publicKey: key.publicKey(), message, signature: Buffer.from(key.sign(digest)).toString('base64'), network: 'Test SDF Network ; September 2015' };
  const verifier = new StellarWalletProofVerifier();
  expect(await verifier.verify(proof)).toBe(true);
  expect(await verifier.verify({ ...proof, message: 'changed' })).toBe(false);
  expect(await verifier.verify({ ...proof, publicKey: Keypair.random().publicKey() })).toBe(false);
  expect(await verifier.verify({ ...proof, signature: 'invalid' })).toBe(false);
  expect(await verifier.verify({ ...proof, network: 'Public Global Stellar Network ; September 2015' })).toBe(false);
});
