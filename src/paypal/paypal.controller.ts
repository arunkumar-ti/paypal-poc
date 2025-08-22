import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { Response } from 'express';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  // Minimal HTML page for entering amount
  @Get()
  getPayPage(@Res() res: Response) {
    res.send(`
      <html>
        <body>
          <h1>PayPal Checkout</h1>
          <form action="/paypal/order" method="POST">
            <input type="text" name="amount" placeholder="Amount" />
            <button type="submit">Pay with PayPal</button>
          </form>
        </body>
      </html>
    `);
  }

  // Create order and redirect to PayPal
  @Post('order')
  async createOrder(@Body() body: { amount: string }, @Res() res: Response) {
    const order = await this.paypalService.createOrder(body.amount);

    const approveUrl = order.links.find((link) => link.rel === 'approve')?.href;
    if (!approveUrl) {
      return res.status(500).send('No approval URL found.');
    }

    // Redirect user to PayPal checkout
    res.redirect(approveUrl);
  }

  // Capture order after PayPal redirects to returnUrl
  @Get('capture')
  async captureOrder(@Query('token') orderId: string, @Res() res: Response) {
    try {
      const capture = await this.paypalService.captureOrder(orderId);
      res.send(`
        <h1>Payment ${capture.status}</h1>
        <pre>${JSON.stringify(capture, null, 2)}</pre>
      `);
    } catch (error) {
      res
        .status(400)
        .send(
          `<h1>Payment Failed</h1><pre>${JSON.stringify(error, null, 2)}</pre>`,
        );
    }
  }

  // Handle canceled payments
  @Get()
  cancelOrder(@Res() res: Response) {
    res.send('<h1>Payment cancelled by user</h1>');
  }
}
