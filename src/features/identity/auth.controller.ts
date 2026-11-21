import { Body, Controller, ForbiddenException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import type { Request, Response } from 'express';
import { RealAuthService } from './real-auth.service.js';
import { SessionAuthGuard, cookieValue } from '../../session-auth.guard.js';

export const SESSION_COOKIE = '__Host-cobusiness_session';
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' };
class CredentialsDto {
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(12) @MaxLength(128) password!: string;
}
function checkOrigin(req: Request) {
  let origin: string | undefined;
  try { origin = process.env.CLIENT_ORIGIN ? new URL(process.env.CLIENT_ORIGIN).origin : undefined; } catch { /* fail closed */ }
  if (!origin || req.headers.origin !== origin) throw new ForbiddenException({ code: 'CSRF_REJECTED', message: 'Invalid request origin' });
}
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: RealAuthService) {}
  @Post('register')
  async register(@Body() body: CredentialsDto, @Req() req: Request) {
    checkOrigin(req);
    await this.auth.limit(req.ip ?? 'unknown', body.email);
    await this.auth.register(body.email, body.password);
    return { registered: true };
  }
  @Post('login')
  async login(@Body() body: CredentialsDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    checkOrigin(req);
    await this.auth.limit(req.ip ?? 'unknown', body.email);
    const token = await this.auth.login(body.email, body.password);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: 7 * 86400000 });
    res.set('Cache-Control', 'no-store');
    return { loggedIn: true };
  }
  @Post('logout') @UseGuards(SessionAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.revoke(cookieValue(req.headers.cookie, SESSION_COOKIE));
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    return { loggedOut: true };
  }
}
