import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { appConfig, jwtConfig, exchangeRateConfig } from './config/envs';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, exchangeRateConfig],
    }),
    PrismaModule,
    AuthModule,
    BooksModule,
    ExchangeRateModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

