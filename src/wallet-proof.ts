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
