import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from '../../application/services/payments.service';
import { VerifyPaymentDto } from '../../application/dtos/verify-payment.dto';
import { VerifySubscriptionPaymentDto } from '../../application/dtos/verify-subscription-dto';

@ApiTags('Payments')
// @ApiSecurity('x-api-key')
// @ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify/order')
  @ApiOperation({ summary: 'Verify payment signature' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto);
  }

  @Post('verify/subscription')
  @ApiOperation({ summary: 'Verify subscription payment signature' })
  @ApiResponse({
    status: 200,
    description: 'Subscription payment verified successfully',
  })
  async verifySubscriptionPayment(
    @Body() verifySubscriptionPaymentDto: VerifySubscriptionPaymentDto,
  ) {
    return this.paymentsService.verifySubscriptionPayment(
      verifySubscriptionPaymentDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }
}
