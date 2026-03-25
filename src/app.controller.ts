import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return {
      status: 'ok',
      service: 'bookstore-inventory-api',
      docs: '/api/docs',
    };
  }
}
