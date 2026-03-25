import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  CreateBookInput,
  createBookSchema,
} from '../schemas/create-book.schema';
import {
  UpdateBookInput,
  updateBookSchema,
} from '../schemas/update-book.schema';
import { BooksService } from '../services/books.service';

@ApiTags('Books')
@Controller('books')
export class BooksWriteController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiResponse({ status: 201, description: 'Libro creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación (campos)' })
  @ApiResponse({ status: 409, description: 'El ISBN ya está registrado' })
  create(@Body(new ZodValidationPipe(createBookSchema)) input: CreateBookInput) {
    return this.booksService.create(input);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar la información de un libro' })
  @ApiResponse({ status: 200, description: 'Libro actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateBookSchema)) input: UpdateBookInput,
  ) {
    return this.booksService.update(id, input);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un libro' })
  @ApiResponse({ status: 200, description: 'Libro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}