import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';

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
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    const secret = configService.getOrThrow<string>('jwt.secret');
    const secretFingerprint = createHash('sha256')
      .update(secret)
      .digest('hex')
      .slice(0, 12);

    // Fingerprint helps compare environments without exposing secrets.
    // eslint-disable-next-line no-console
    console.log(`[JWT] secret fingerprint: ${secretFingerprint}`);

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractTokenFromAuthorizationHeader,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.logger.log(`JWT strategy initialized (fingerprint: ${secretFingerprint})`);
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
