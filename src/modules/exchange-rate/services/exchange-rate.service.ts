import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

export interface ExchangeRateResult {
  rate: number;
  currency: string;
  source: 'api' | 'fallback';
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly apiUrl: string;
  private readonly defaultCurrency: string;
  private readonly defaultRate: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>('exchangeRate.apiUrl');
    this.defaultCurrency = this.configService.getOrThrow<string>(
      'exchangeRate.defaultCurrency',
    );
    this.defaultRate = this.configService.getOrThrow<number>(
      'exchangeRate.defaultRate',
    );
  }

  // Obtener la tasa de cambio desde una API externa, o usar fallback en caso de error
  async getRate(currency?: string): Promise<ExchangeRateResult> {
    const targetCurrency = (currency || this.defaultCurrency).toUpperCase();

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ExchangeRateResponse>(this.apiUrl, {
          timeout: 5000,
        }),
      );

      if (!data?.rates) {
        throw new Error('Exchange Rate API response without rates payload');
      }

      const rate = data.rates[targetCurrency];

      if (!rate) {
        throw new HttpException(
          `La divisa "${targetCurrency}" no fue encontrada en la respuesta de Exchange Rate API`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return { rate, currency: targetCurrency, source: 'api' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.warn(
        `Error al consumir la API de tipo de cambio, utilizando fallback configurado: ${this.defaultRate} para ${targetCurrency}`,
      );

      return {
        rate: this.defaultRate,
        currency: targetCurrency,
        source: 'fallback',
      };
    }
  }
}
