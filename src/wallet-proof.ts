export const WALLET_PROOF_VERIFIER = Symbol('WALLET_PROOF_VERIFIER');

export interface WalletProofVerifier {
  verify(input: {
    publicKey: string;
    message: string;
    signature: string;
    network: string;
  }): Promise<boolean>;
}

export class UnavailableWalletProofVerifier implements WalletProofVerifier {
  async verify(): Promise<boolean> {
    return false;
  }
}
import { createHash } from 'node:crypto';
import { Keypair, StrKey } from '@stellar/stellar-sdk';


/** SEP-53 signatures are 64 bytes, represented here as canonical base64. */
export class StellarWalletProofVerifier implements WalletProofVerifier {
  async verify(input: {
    publicKey: string;
    message: string;
    signature: string;
    network: string;
  }): Promise<boolean> {
    if (input.network !== 'Test SDF Network ; September 2015' ||
        !StrKey.isValidEd25519PublicKey(input.publicKey) ||
        !/^[A-Za-z0-9+/]{86}==$/.test(input.signature)) return false;
    const signature = Buffer.from(input.signature, 'base64');
    if (signature.length !== 64 || signature.toString('base64') !== input.signature) return false;
    const digest = createHash('sha256')
      .update('Stellar Signed Message:\n', 'utf8')
      .update(input.message, 'utf8')
      .digest();
    return Keypair.fromPublicKey(input.publicKey).verify(digest, signature);
  }
}
