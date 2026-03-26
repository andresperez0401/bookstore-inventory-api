import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
}

const extractTokenFromAuthorizationHeader = (request: Request): string | null => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Accept:
  // - "Bearer <token>"
  // - "Bearer Bearer <token>" (common copy/paste mistake)
  // - "<token>"
  return authHeader
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.getOrThrow<string>('jwt.secret');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractTokenFromAuthorizationHeader,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
