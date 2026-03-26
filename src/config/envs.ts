import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'secretkey',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));

export const exchangeRateConfig = registerAs('exchangeRate', () => ({
  apiUrl:
    process.env.EXCHANGE_RATE_API_URL ||
    'https://api.exchangerate-api.com/v4/latest/USD',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'EUR',
  defaultRate: parseFloat(process.env.DEFAULT_EXCHANGE_RATE || '0.92'),
  profitMarginPercentage: parseFloat(
    process.env.PROFIT_MARGIN_PERCENTAGE || '40',
  ),
}));
