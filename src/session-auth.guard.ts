import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { Actor } from './core/demo-state.store.js';
import { RealAuthService } from './features/identity/real-auth.service.js';

export type AuthenticatedRequest = Request & { actor: Actor };
export function cookieValue(header: string | undefined, name: string): string {
  const values = (header ?? '').split(';').map((s) => s.trim()).filter((s) => s.startsWith(name + '='));
  return values.length === 1 ? values[0].slice(name.length + 1) : '';
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly auth: RealAuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const configured = process.env.AUTH_SUCCESS_REDIRECT;
      let origin: string | undefined;
      try { origin = configured ? new URL(configured).origin : undefined; } catch { /* fail closed */ }
      if (!origin || request.headers.origin !== origin) throw new ForbiddenException({ code: 'CSRF_REJECTED', message: 'Invalid request origin' });
    }
    const actor = await this.auth.authenticate(cookieValue(request.headers.cookie, '__Host-cobusiness_session'));
    if (!actor) throw new UnauthorizedException({ code: 'AUTH_REQUIRED', message: 'A valid session is required' });
    request.actor = actor;
    return true;
  }
}
