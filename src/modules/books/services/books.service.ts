import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExchangeRateService } from '../../exchange-rate/services/exchange-rate.service';
import { Prisma } from '@prisma/client';
import { CreateBookInput } from '../schemas/create-book.schema';
import { UpdateBookInput } from '../schemas/update-book.schema';
import { BookQueryInput } from '../schemas/book-query.schema';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly configService: ConfigService,
  ) {}


 // -----------------------------------------------------------------------------------------------------------------
 // Crear un nuevo libro. Valida que no exista otro con el mismo ISBN (retorna ConflictException)

  async create(input: CreateBookInput) {
    const existing = await this.prisma.book.findUnique({
      where: { isbn: input.isbn },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un libro con el ISBN "${input.isbn}"`,
      );
    }

    return this.prisma.book.create({ data: input });
  }

  // ----------------------------------------------------------------------------------------------------------------


  // ----------------------------------------------------------------------------------------------------------------
  // Obtener todos los libros con paginación

  async findAll(query: BookQueryInput) {
    const { page, limit, category, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ----------------------------------------------------------------------------------------------------------------


  // ----------------------------------------------------------------------------------------------------------------
  // Obtener detalle de 1 libro por su id

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Libro con el ID "${id}" no encontrado`);
    }

    return book;
  }

  // ----------------------------------------------------------------------------------------------------------------


  // ----------------------------------------------------------------------------------------------------------------
  // Obtener libros por categoría (reutiliza findAll pero con filtro de categoría)
  
  async findByCategory(category: string, query: BookQueryInput) {
    return this.findAll({ ...query, category });
  }

  // ----------------------------------------------------------------------------------------------------------------


  // ----------------------------------------------------------------------------------------------------------------
  // Filtrar stock bajo

  async findLowStock(threshold: number, query: BookQueryInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {
      stockQuantity: { lte: threshold },
    };

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { stockQuantity: 'asc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        threshold,
      },
    };
  }

  // ----------------------------------------------------------------------------------------------------------------


  // ----------------------------------------------------------------------------------------------------------------
  // Actualizar un libro. Valida que el libro exista y que el nuevo ISBN (si se envía) no esté registrado por otro libro.

  async update(id: string, dto: UpdateBookInput) {
    
    const book = await this.findOne(id);

    if (dto.isbn) {
      const existing = await this.prisma.book.findFirst({
        where: { isbn: dto.isbn, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un libro con el ISBN "${dto.isbn}"`,
        );
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: dto,
    });
  }

  // ----------------------------------------------------------------------------------------------------------------


  // ----------------------------------------------------------------------------------------------------------------
  // Eliminar un libro

  async remove(id: string) {

    const book = await this.findOne(id);

    await this.prisma.book.delete({ where: { id } });

    return { message: `El libro con ID "${id}" fue eliminado exitosamente` };
  }

  // ----------------------------------------------------------------------------------------------------------------

  // Lógica principal: calcula la tasa, el precio final con ganancia, un lo actualiza en base de datos.
  async calculatePrice(id: string, currency?: string) {
    const book = await this.findOne(id);

    const exchangeResult = await this.exchangeRateService.getRate(currency);
    const profitMargin = this.configService.get<number>(
      'exchangeRate.profitMarginPercentage',
    )!;

    const costUsd = Number(book.costUsd);
    const rate = exchangeResult.rate;
    const costLocal = parseFloat((costUsd * rate).toFixed(2));
    const sellingPriceLocal = parseFloat(
      (costLocal * (1 + profitMargin / 100)).toFixed(2),
    );

    // Actualizamos la ganancia local (sellingPriceLocal)
    await this.prisma.book.update({
      where: { id },
      data: { sellingPriceLocal },
    });

    const calculationTimestamp = new Date()
      .toISOString()
      .replace(/\.\d{3}Z$/, 'Z');

    return {
      book_id: book.id,
      cost_usd: costUsd,
      exchange_rate: rate,
      cost_local: costLocal,
      margin_percentage: profitMargin,
      selling_price_local: sellingPriceLocal,
      currency: exchangeResult.currency,
      calculation_timestamp: calculationTimestamp,
    };
  }
}

