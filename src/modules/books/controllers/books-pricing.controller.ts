import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  calculatePriceQuerySchema,
  CalculatePriceQueryInput,
} from '../schemas/calculate-price.schema';
import { BooksService } from '../services/books.service';

@ApiTags('Books')
@Controller('books')
export class BooksPricingController {
  constructor(private readonly booksService: BooksService) {}

  @Post(':id/calculate-price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calcular margen de ganancia en divisa local' })
  @ApiResponse({ status: 200, description: 'Cálculo de precio y actualización exitosa' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  calculatePrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(calculatePriceQuerySchema))
    query: CalculatePriceQueryInput,
  ) {
    return this.booksService.calculatePrice(id, query.currency);
  }
}