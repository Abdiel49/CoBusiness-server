import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type WalletChallenge = {
  id: string;
  userId: string;
  nonce: string;
  network: string;
  expiresAt: Date;
};

/** PostgreSQL is the authority for challenge consumption and wallet ownership. */
@Injectable()
export class WalletBindingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createChallenge(challenge: WalletChallenge): Promise<void> {
    await this.dataSource.query(
      'INSERT INTO wallet_challenges (id, user_id, nonce, network, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [challenge.id, challenge.userId, challenge.nonce, challenge.network, challenge.expiresAt],
    );
  }

  async bind(input: {
    challengeId: string;
    userId: string;
    publicKey: string;
    network: string;
    verify: (nonce: string) => Promise<boolean>;
  }): Promise<'bound' | 'invalid_challenge' | 'invalid_proof' | 'owned'> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const rows: Array<{ nonce: string }> = await manager.query(
          `SELECT nonce FROM wallet_challenges WHERE id = $1 AND user_id = $2
           AND network = $3 AND consumed_at IS NULL AND expires_at > clock_timestamp() FOR UPDATE`,
          [input.challengeId, input.userId, input.network],
        );
        if (!rows.length) return 'invalid_challenge';
        if (!(await input.verify(rows[0].nonce))) return 'invalid_proof';
        const consumed: Array<{ id: string }> = await manager.query(
          `WITH updated AS (UPDATE wallet_challenges SET consumed_at = clock_timestamp()
           WHERE id = $1 AND expires_at > clock_timestamp() RETURNING id) SELECT id FROM updated`,
          [input.challengeId],
        );
        if (!consumed.length) return 'invalid_challenge';
        await manager.query(
          `INSERT INTO wallet_bindings (user_id, public_key, network)
           VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE
           SET public_key = EXCLUDED.public_key, network = EXCLUDED.network, verified_at = now()`,
          [input.userId, input.publicKey, input.network],
        );
        return 'bound';
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === '23505') return 'owned';
      throw error;
    }
  }

  async revoke(userId: string): Promise<boolean> {
    const rows: Array<{ user_id: string }> = await this.dataSource.query(
      'WITH deleted AS (DELETE FROM wallet_bindings WHERE user_id = $1 RETURNING user_id) SELECT user_id FROM deleted',
      [userId],
    );
    return rows.length > 0;
  }

  async find(userId: string): Promise<string | null> {
    const rows: Array<{ public_key: string }> = await this.dataSource.query(
      'SELECT public_key FROM wallet_bindings WHERE user_id = $1', [userId],
    );
    return rows[0]?.public_key ?? null;
  }
}
