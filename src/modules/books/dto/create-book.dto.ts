import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: '9780132350884', description: 'ISBN-10 or ISBN-13' })
  @IsString()
  @Matches(/^(\d{10}|\d{13})$/, {
    message: 'ISBN must be exactly 10 or 13 digits',
  })
  isbn: string;

  @ApiProperty({ example: 29.99, description: 'Cost in USD, must be > 0' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'cost_usd must be greater than 0' })
  costUsd: number;

  @ApiProperty({ example: 25, description: 'Stock quantity, >= 0' })
  @IsInt()
  @Min(0, { message: 'stock_quantity cannot be negative' })
  stockQuantity: number;

  @ApiProperty({ example: 'Programming' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  supplierCountry: string;

  @ApiPropertyOptional({
    example: 19.03,
    description: 'Selling price in local currency',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellingPriceLocal?: number;
}
