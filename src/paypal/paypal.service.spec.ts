import { Test, TestingModule } from '@nestjs/testing';
import { PaypalService } from './paypal.service';
import { ConfigService } from '@nestjs/config';

describe('PaypalService', () => {
  let service: PaypalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaypalService,
        {
          provide: ConfigService,
          useValue: new ConfigService({
            NODE_ENV: 'development',
          }),
        },
      ],
    }).compile();

    service = module.get<PaypalService>(PaypalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
