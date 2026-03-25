import { Module } from '@nestjs/common';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';
import { BooksPricingController } from './controllers/books-pricing.controller';
import { BooksQueryController } from './controllers/books-query.controller';
import { BooksWriteController } from './controllers/books-write.controller';
import { BooksService } from './services/books.service';

@Module({
  imports: [ExchangeRateModule],
  controllers: [BooksQueryController, BooksWriteController, BooksPricingController],
  providers: [BooksService],
})
export class BooksModule {}
