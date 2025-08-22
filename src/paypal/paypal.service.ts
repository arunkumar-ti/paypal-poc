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
  VaultController,
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

  async storeCardInVault(
    userId: string,
    card: {
      number: string;
      expiry: string;
      securityCode: string;
      name: string;
      billingAddress: {
        addressLine1: string;
        adminArea2: string;
        adminArea1: string;
        postalCode: string;
        countryCode: string;
      };
    },
  ) {
    const request = new VaultController(this.client);

    try {
      const response = await request.createPaymentToken({
        body: {
          customer: { merchantCustomerId: userId }, // your own user id mapping
          paymentSource: {
            card: {
              ...card,
            },
          },
        },
      });

      return response.result; // contains vault token
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async listVaultedCards(customerId: string) {
    const request = new VaultController(this.client);

    try {
      const response = await request.listCustomerPaymentTokens({ customerId });

      return response.result; // array of vaulted methods
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
