import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  Headers,
  RawBodyRequest,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

class CreateCheckoutSessionDto {
  tier: 'FREE' | 'GOLD';
}

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session for subscription' })
  @ApiBody({ type: CreateCheckoutSessionDto })
  async createCheckoutSession(
    @Req() req: RequestWithUser,
    @Body() body: CreateCheckoutSessionDto,
  ) {
    if (!body.tier || !['FREE', 'GOLD'].includes(body.tier)) {
      throw new BadRequestException('Invalid tier');
    }

    const url = await this.stripeService.createCheckoutSession(
      req.user.id,
      body.tier,
    );

    return { url };
  }

  @Post('cancel-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel user subscription' })
  async cancelSubscription(@Req() req: RequestWithUser) {
    await this.stripeService.cancelSubscription(req.user.id);
    return { message: 'Subscription will be canceled at period end' };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing request body');
    }

    return await this.stripeService.handleWebhook(signature, rawBody);
  }
}
