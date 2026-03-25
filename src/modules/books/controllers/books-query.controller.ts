import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { bookQuerySchema, BookQueryInput } from '../schemas/book-query.schema';
import { BooksService } from '../services/books.service';

@ApiTags('Books')
@Controller('books')
export class BooksQueryController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar libros con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Listado de libros' })
  findAll(@Query(new ZodValidationPipe(bookQuerySchema)) query: BookQueryInput) {
    return this.booksService.findAll(query);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Buscar libros por categoría' })
  @ApiResponse({ status: 200, description: 'Listado filtrado por categoría' })
  @ApiResponse({ status: 400, description: 'Debe enviar category en query params' })
  search(@Query(new ZodValidationPipe(bookQuerySchema)) query: BookQueryInput) {
    if (!query.category) {
      throw new BadRequestException('Query param "category" is required');
    }

    return this.booksService.findByCategory(query.category, query);
  }

  @Get('category/:category')
  @Public()
  @ApiOperation({ summary: 'Obtener libros por categoría' })
  @ApiResponse({ status: 200, description: 'Listado filtrado por categoría' })
  findByCategory(
    @Param('category') category: string,
    @Query(new ZodValidationPipe(bookQuerySchema)) query: BookQueryInput,
  ) {
    return this.booksService.findByCategory(category, query);
  }

  @Get('low-stock')
  @Public()
  @ApiOperation({ summary: 'Obtener libros con stock bajo' })
  @ApiResponse({ status: 200, description: 'Listado de libros con stock bajo' })
  findLowStock(@Query(new ZodValidationPipe(bookQuerySchema)) query: BookQueryInput) {
    const threshold = query.threshold ?? 10;
    return this.booksService.findLowStock(threshold, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener detalle de libro por id' })
  @ApiResponse({ status: 200, description: 'Detalle de libro' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }
}
