# PayPal POC

A proof-of-concept NestJS application demonstrating integration with the PayPal API for order creation, payment capture, and card vaulting.

## Features

- Create PayPal orders and capture payments (standard checkout flow)
- Store cards in PayPal Vault
- List vaulted cards for a customer
- Pay with a vaulted card

## Project Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID_SANDBOX=your-sandbox-client-id
PAYPAL_CLIENT_SECRET_SANDBOX=your-sandbox-client-secret
PAYPAL_CLIENT_ID_LIVE=your-live-client-id
PAYPAL_CLIENT_SECRET_LIVE=your-live-client-secret
PAYPAL_CURRENCY=USD
PAYPAL_RETURN_URL=https://your-app.com/paypal/return
PAYPAL_CANCEL_URL=https://your-app.com/paypal/cancel
```

## Running the Project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run start:prod
```

## Running Tests

```bash
# unit tests
npm run test

# test coverage
npm run test:cov
```

## Project Structure

- `src/paypal/paypal.service.ts` – Main service for PayPal integration
- `test/paypal.service.spec.ts` – Unit tests for PayPal service

## Usage

Inject `PaypalService` into your controllers or other services to use PayPal payment and vault features.
