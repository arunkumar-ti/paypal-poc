import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [PaypalService],
  controllers: [PaypalController],
})
export class PaypalModule {}
