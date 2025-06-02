
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentSchemeService } from '../services/payment-scheme.service';
import { PaymentSchemeType } from '../entities/payment-scheme.entity';
import { CreatePaymentSchemeDto } from '../dto/create-payment-scheme.dto';
import { UpdatePaymentSchemeDto } from '../dto/update-payment-scheme.dto';
import {
  PaymentSchemeResponseDto,
  PaymentSchemeListResponseDto,
  SchemeAvailabilityResponseDto,
  FeeCalculationResponseDto,
  SchemeCompatibilityResponseDto,
} from '../dto/payment-scheme-response.dto';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // When auth is ready

@ApiTags('Payment Schemes')
@Controller('api/payment-schemes')
// @UseGuards(JwtAuthGuard) // Enable when authentication is implemented
export class PaymentSchemeController {
  constructor(private readonly paymentSchemeService: PaymentSchemeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new payment scheme',
    description: 'Creates a new payment scheme with type-specific configuration and validation.',
  })
  @ApiBody({
    type: CreatePaymentSchemeDto,
    description: 'Payment scheme configuration data',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment scheme created successfully',
    type: PaymentSchemeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration or validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Payment scheme with this configuration already exists',
  })
  async createPaymentScheme(
    @Body(ValidationPipe) createDto: CreatePaymentSchemeDto,
  ): Promise<PaymentSchemeResponseDto> {
    const paymentScheme = await this.paymentSchemeService.createPaymentScheme(createDto);
    return PaymentSchemeResponseDto.fromEntity(paymentScheme);
  }

  @Get()
  @ApiOperation({
    summary: 'Get payment schemes with filtering and pagination',
    description: 'Retrieves a paginated list of payment schemes with optional filtering by type, currency, etc.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: PaymentSchemeType,
    description: 'Filter by payment scheme type',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    type: String,
    description: 'Filter by currency (3-letter ISO code)',
    example: 'EUR',
  })
  @ApiQuery({
    name: 'country_scope',
    required: false,
    type: String,
    description: 'Filter by country or region scope',
    example: 'EU',
  })
  @ApiQuery({
    name: 'supports_fx',
    required: false,
    type: Boolean,
    description: 'Filter by FX support capability',
  })
  @ApiQuery({
    name: 'operational_only',
    required: false,
    type: Boolean,
    description: 'Return only currently operational schemes',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment schemes retrieved successfully',
    type: PaymentSchemeListResponseDto,
  })
  async getPaymentSchemes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: PaymentSchemeType,
    @Query('currency') currency?: string,
    @Query('country_scope') country_scope?: string,
    @Query('supports_fx') supports_fx?: boolean,
    @Query('operational_only') operational_only?: boolean,
  ): Promise<PaymentSchemeListResponseDto> {
    // Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 100);

    const filters = {
      type,
      currency,
      country_scope,
      supports_fx,
      operational_only,
    };

    const pagination = {
      page,
      limit: validLimit,
    };

    const result = await this.paymentSchemeService.getPaymentSchemes(filters, pagination);
    return PaymentSchemeListResponseDto.fromPaginatedResult(result);
  }

  @Get(':schemeId')
  @ApiOperation({
    summary: 'Get payment scheme by ID',
    description: 'Retrieves a specific payment scheme by its unique identifier.',
  })
  @ApiParam({
    name: 'schemeId',
    description: 'Payment scheme unique identifier (ULID)',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment scheme retrieved successfully',
    type: PaymentSchemeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment scheme not found',
  })
  async getPaymentScheme(
    @Param('schemeId') schemeId: string,
  ): Promise<PaymentSchemeResponseDto> {
    const paymentScheme = await this.paymentSchemeService.getPaymentScheme(schemeId);
    return PaymentSchemeResponseDto.fromEntity(paymentScheme);
  }

  @Put(':schemeId')
  @ApiOperation({
    summary: 'Update payment scheme',
    description: 'Updates an existing payment scheme with new configuration.',
  })
  @ApiParam({
    name: 'schemeId',
    description: 'Payment scheme unique identifier (ULID)',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @ApiBody({
    type: UpdatePaymentSchemeDto,
    description: 'Payment scheme update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment scheme updated successfully',
    type: PaymentSchemeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment scheme not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data or validation error',
  })
  async updatePaymentScheme(
    @Param('schemeId') schemeId: string,
    @Body(ValidationPipe) updateDto: UpdatePaymentSchemeDto,
  ): Promise<PaymentSchemeResponseDto> {
    const updated = await this.paymentSchemeService.updatePaymentScheme(schemeId, updateDto);
    return PaymentSchemeResponseDto.fromEntity(updated);
  }

  @Delete(':schemeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete payment scheme',
    description: 'Deletes a payment scheme. Fails if scheme is in use by payment methods.',
  })
  @ApiParam({
    name: 'schemeId',
    description: 'Payment scheme unique identifier (ULID)',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @ApiResponse({
    status: 204,
    description: 'Payment scheme deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment scheme not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Payment scheme is in use and cannot be deleted',
  })
  async deletePaymentScheme(@Param('schemeId') schemeId: string): Promise<void> {
    await this.paymentSchemeService.deletePaymentScheme(schemeId);
  }

  @Get('types/:type')
  @ApiOperation({
    summary: 'Get payment schemes by type',
    description: 'Retrieves all payment schemes of a specific type (fiat, crypto, or fx).',
  })
  @ApiParam({
    name: 'type',
    enum: PaymentSchemeType,
    description: 'Payment scheme type',
    example: PaymentSchemeType.FIAT,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment schemes retrieved successfully',
    type: [PaymentSchemeResponseDto],
  })
  async getPaymentSchemesByType(
    @Param('type') type: PaymentSchemeType,
  ): Promise<PaymentSchemeResponseDto[]> {
    const schemes = await this.paymentSchemeService.getSchemesByType(type);
    return schemes.map(scheme => PaymentSchemeResponseDto.fromEntity(scheme));
  }

  @Get('currency/:currency')
  @ApiOperation({
    summary: 'Get payment schemes by currency',
    description: 'Retrieves payment schemes that support a specific currency (as primary or target).',
  })
  @ApiParam({
    name: 'currency',
    description: 'Currency code (3-letter ISO code)',
    example: 'EUR',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment schemes retrieved successfully',
    type: [PaymentSchemeResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid currency code format',
  })
  async getPaymentSchemesByCurrency(
    @Param('currency') currency: string,
  ): Promise<PaymentSchemeResponseDto[]> {
    const schemes = await this.paymentSchemeService.getSchemesByCurrency(currency);
    return schemes.map(scheme => PaymentSchemeResponseDto.fromEntity(scheme));
  }

  @Get('operational/current')
  @ApiOperation({
    summary: 'Get currently operational payment schemes',
    description: 'Retrieves payment schemes that are currently operational based on time and availability rules.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operational payment schemes retrieved successfully',
    type: [PaymentSchemeResponseDto],
  })
  async getOperationalPaymentSchemes(): Promise<PaymentSchemeResponseDto[]> {
    const schemes = await this.paymentSchemeService.getOperationalSchemes();
    return schemes.map(scheme => PaymentSchemeResponseDto.fromEntity(scheme));
  }

  @Get(':schemeId/availability')
  @ApiOperation({
    summary: 'Check payment scheme availability',
    description: 'Checks if a payment scheme is currently operational and provides availability details.',
  })
  @ApiParam({
    name: 'schemeId',
    description: 'Payment scheme unique identifier (ULID)',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @ApiQuery({
    name: 'check_time',
    required: false,
    type: String,
    description: 'Time to check availability for (ISO 8601 format, defaults to current time)',
    example: '2025-02-06T14:30:00Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheme availability checked successfully',
    type: SchemeAvailabilityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment scheme not found',
  })
  async checkSchemeAvailability(
    @Param('schemeId') schemeId: string,
    @Query('check_time') checkTime?: string,
  ): Promise<SchemeAvailabilityResponseDto> {
    const checkDate = checkTime ? new Date(checkTime) : undefined;
    const availability = await this.paymentSchemeService.checkSchemeAvailability(schemeId, checkDate);
    return SchemeAvailabilityResponseDto.fromResult(availability);
  }

  @Post(':schemeId/calculate-fees')
  @ApiOperation({
    summary: 'Calculate payment fees',
    description: 'Calculates total fees for a payment amount using the specified scheme.',
  })
  @ApiParam({
    name: 'schemeId',
    description: 'Payment scheme unique identifier (ULID)',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Payment amount',
          example: 1000.00,
        },
        source_currency: {
          type: 'string',
          description: 'Source currency (3-letter ISO code)',
          example: 'EUR',
        },
        target_currency: {
          type: 'string',
          description: 'Target currency (3-letter ISO code)',
          example: 'USD',
        },
      },
      required: ['amount'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fees calculated successfully',
    type: FeeCalculationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount or currency parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment scheme not found',
  })
  async calculatePaymentFees(
    @Param('schemeId') schemeId: string,
    @Body() body: { amount: number; source_currency?: string; target_currency?: string },
  ): Promise<FeeCalculationResponseDto> {
    const { amount, source_currency, target_currency } = body;
    
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const calculation = await this.paymentSchemeService.calculatePaymentFees(
      schemeId,
      amount,
      source_currency,
      target_currency,
    );
    
    return FeeCalculationResponseDto.fromResult(calculation);
  }

  @Post(':schemeId/validate-compatibility')
  @ApiOperation({
    summary: 'Validate scheme compatibility',
    description: 'Validates if a payment scheme is compatible with specific currency pair and amount.',
  })
  @ApiParam({
    name: 'schemeId',
    description: 'Payment scheme unique identifier (ULID)',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        source_currency: {
          type: 'string',
          description: 'Source currency (3-letter ISO code)',
          example: 'EUR',
        },
        target_currency: {
          type: 'string',
          description: 'Target currency (3-letter ISO code)',
          example: 'USD',
        },
        amount: {
          type: 'number',
          description: 'Payment amount',
          example: 1000.00,
        },
      },
      required: ['source_currency', 'target_currency', 'amount'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Compatibility validated successfully',
    type: SchemeCompatibilityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid currency or amount parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment scheme not found',
  })
  async validateSchemeCompatibility(
    @Param('schemeId') schemeId: string,
    @Body() body: { source_currency: string; target_currency: string; amount: number },
  ): Promise<SchemeCompatibilityResponseDto> {
    const { source_currency, target_currency, amount } = body;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const isCompatible = await this.paymentSchemeService.validateSchemeCompatibility(
      schemeId,
      source_currency,
      target_currency,
      amount,
    );

    return SchemeCompatibilityResponseDto.fromResult({
      scheme_id: schemeId,
      is_compatible: isCompatible,
      source_currency,
      target_currency,
      amount,
    });
  }
}
