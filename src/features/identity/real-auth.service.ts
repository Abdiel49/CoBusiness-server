import { ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import type { Actor } from '../../core/demo-state.store.js';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const failure = () => new UnauthorizedException({ code: 'AUTH_INVALID', message: 'Invalid email or password' });

@Injectable()
export class RealAuthService {
  constructor(private readonly db: DataSource) {}

  async limit(ip: string, email: string): Promise<void> {
    for (const key of [`ip:${ip}`, `email:${email.toLowerCase().trim()}`]) {
      const rows: Array<{ count: number }> = await this.db.query(`INSERT INTO auth_attempts (key, count, expires_at) VALUES ($1, 1, now() + interval '15 minutes')
        ON CONFLICT (key) DO UPDATE SET count = CASE WHEN auth_attempts.expires_at <= now() THEN 1 ELSE auth_attempts.count + 1 END,
        expires_at = CASE WHEN auth_attempts.expires_at <= now() THEN now() + interval '15 minutes' ELSE auth_attempts.expires_at END RETURNING count`, [hash(key)]);
      if (rows[0].count > 10) throw new HttpException('Too many authentication attempts', 429);
    }
  }

  async register(email: string, password: string): Promise<void> {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    try {
      await this.db.query('INSERT INTO app_users (id, email, password_hash) VALUES ($1, $2, $3)', [randomUUID(), email.trim().toLowerCase(), passwordHash]);
    } catch (error: unknown) {
      if ((error as { code?: string }).code === '23505') throw new ConflictException({ code: 'EMAIL_EXISTS', message: 'Email already registered' });
      throw error;
    }
  }

  async login(email: string, password: string): Promise<string> {
    const rows: Array<{ id: string; password_hash: string | null }> = await this.db.query('SELECT id, password_hash FROM app_users WHERE lower(trim(email)) = $1', [email.trim().toLowerCase()]);
    // A fixed valid hash keeps nonexistent and passwordless users on the same verification path.
    const dummy = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$8HBmSwlR2I+SRL4DBoY2EJHVMh5MSPN8mhK5IVlPcgU';
    const valid = await argon2.verify(rows[0]?.password_hash ?? dummy, password).catch(() => false);
    if (!rows[0]?.password_hash || !valid) throw failure();
    const token = randomBytes(32).toString('base64url');
    await this.db.query("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '7 days')", [hash(token), rows[0].id]);
    return token;
  }

  async authenticate(token: string): Promise<Actor | null> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const rows: Actor[] = await this.db.query('SELECT u.id, u.role FROM auth_sessions s JOIN app_users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()', [hash(token)]);
    return rows[0] ?? null;
  }
  async revoke(token: string): Promise<void> {
    if (/^[A-Za-z0-9_-]{43}$/.test(token)) await this.db.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hash(token)]);
  }
}
