import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class DemoAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (process.env.NODE_ENV === 'production')
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Demo authentication is disabled in production',
      });
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const token =
      request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
    const validTokens = new Set([
      'demo:buyer-demo:buyer',
      'demo:operator-demo:operator',
      'demo:cobusiness-demo:cobusiness',
      'demo:admin-demo:admin',
    ]);
    if (!validTokens.has(token))
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'A valid demo session is required',
      });
    return true;
  }
}
