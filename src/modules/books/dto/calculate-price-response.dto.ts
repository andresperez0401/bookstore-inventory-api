import { ApiProperty } from '@nestjs/swagger';

export class CalculatePriceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  book_id: string;

  @ApiProperty({ example: 15.99 })
  cost_usd: number;

  @ApiProperty({ example: 0.85 })
  exchange_rate: number;

  @ApiProperty({ example: 13.59 })
  cost_local: number;

  @ApiProperty({ example: 40 })
  margin_percentage: number;

  @ApiProperty({ example: 19.03 })
  selling_price_local: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiProperty({ example: 'api', enum: ['api', 'fallback'] })
  rate_source: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  calculation_timestamp: string;
}
