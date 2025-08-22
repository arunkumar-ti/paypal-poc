import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrderCaptureRequest,
  OrderRequest,
  OrdersController,
} from '@paypal/paypal-server-sdk';

@Injectable()
export class PaypalService {
  client: Client;
  constructor(private configService: ConfigService) {
    const mode = this.configService.get<string>('PAYPAL_MODE') || 'sandbox';
    const clientId = this.configService.get<string>(
      mode === 'live' ? 'PAYPAL_CLIENT_ID_LIVE' : 'PAYPAL_CLIENT_ID_SANDBOX',
    );
    const clientSecret = this.configService.get<string>(
      mode === 'live'
        ? 'PAYPAL_CLIENT_SECRET_LIVE'
        : 'PAYPAL_CLIENT_SECRET_SANDBOX',
    );

    const environment =
      mode === 'live' ? Environment.Production : Environment.Sandbox;

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: {
          logBody: true,
        },
        logResponse: {
          logHeaders: true,
        },
      },
    });
  }

  async createOrder(amount: string) {
    const request = new OrdersController(this.client);
    const data = await request.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode:
                this.configService.get<string>('PAYPAL_CURRENCY') || 'USD',
              value: amount,
            },
          },
        ],
        applicationContext: {
          returnUrl: this.configService.get<string>('PAYPAL_RETURN_URL'),
          cancelUrl: this.configService.get<string>('PAYPAL_CANCEL_URL'),
          brandName: 'vinfonet',
        },
      },
    });

    return data.result;
  }

  async captureOrder(orderId: string) {
    const request = new OrdersController(this.client);
    try {
      const response = await request.captureOrder({ id: orderId, body: {} });
      return response.result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new BadRequestException(error);
      }
    }
  }
}
