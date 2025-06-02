import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpStatus,
  HttpException,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { 
  ExternalPartyService, 
  PartyNotFoundException, 
  InvalidKycTransitionException, 
  ComplianceViolationException,
  DuplicatePartyException, 
  ValidationException,
  AssociatedAccountsException
} from '../services/external-party.service';
import { CreateExternalPartyDto } from '../dto/create-external-party.dto';
import { UpdateExternalPartyDto, UpdateKycStatusDto } from '../dto/update-external-party.dto';
import { QueryExternalPartiesDto } from '../dto/query-external-parties.dto';
import { 
  ExternalPartyResponseDto, 
  PaginatedExternalPartiesResponseDto,
  ExternalPartyStatisticsDto,
  PartiesRequiringAttentionDto,
  BulkKycUpdateResponseDto
} from '../dto/external-party-response.dto';
import { ExternalParty, ExternalPartyType, KycStatus } from '../entities/external-party.entity';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('External Parties')
@Controller('api/external-parties')
export class ExternalPartyController {
  constructor(private readonly externalPartyService: ExternalPartyService) {}

  @ApiOperation({ 
    summary: 'Create a new external party',
    description: 'Creates external party with automatic KYC status assignment and compliance validation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'External party created successfully', 
    type: ExternalPartyResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data or validation error' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'External party with same name and jurisdiction already exists' 
  })
  @Public()
  @Post()
  async createParty(@Body(ValidationPipe) createDto: CreateExternalPartyDto): Promise<ExternalPartyResponseDto> {
    try {
      const party = await this.externalPartyService.createParty(createDto);
      return this.mapToResponseDto(party);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'List external parties with filtering and pagination',
    description: 'Retrieves paginated external parties with filtering by type, jurisdiction, and KYC status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'External parties retrieved successfully', 
    type: PaginatedExternalPartiesResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid query parameters' 
  })
  @Public()
  @Get()
  async findParties(@Query(ValidationPipe) queryDto: QueryExternalPartiesDto): Promise<PaginatedExternalPartiesResponseDto> {
    try {
      // Build filters from query
      const filters = {
        type: queryDto.type,
        jurisdiction: queryDto.jurisdiction,
        kycStatus: queryDto.kycStatus,
        relationshipStartBefore: queryDto.relationshipStartBefore,
        relationshipStartAfter: queryDto.relationshipStartAfter,
        hasNotes: queryDto.hasNotes,
        requiresReview: queryDto.requiresReview
      };

      const options = {
        page: queryDto.page,
        limit: queryDto.limit,
        sortBy: queryDto.sortBy,
        sortOrder: queryDto.sortOrder
      };

      const result = await this.externalPartyService.findParties(filters, options);
      return {
        data: result.data.map(party => this.mapToResponseDto(party)),
        pagination: result.pagination
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Get a specific external party by ID',
    description: 'Retrieves detailed information about a specific external party'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'External party ID (ULID)', 
    example: '01H5EXTERNAL123456789' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'External party retrieved successfully', 
    type: ExternalPartyResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'External party not found' 
  })
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ExternalPartyResponseDto> {
    try {
      const party = await this.externalPartyService.findById(id);
      return this.mapToResponseDto(party);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Update an external party',
    description: 'Updates an existing external party with the provided data (excludes KYC status)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'External party ID (ULID)', 
    example: '01H5EXTERNAL123456789' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'External party updated successfully', 
    type: ExternalPartyResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'External party not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'External party with same name and jurisdiction already exists' 
  })
  @Public()
  @Put(':id')
  async updateParty(
    @Param('id') id: string, 
    @Body(ValidationPipe) updateDto: UpdateExternalPartyDto
  ): Promise<ExternalPartyResponseDto> {
    try {
      const party = await this.externalPartyService.updateParty(id, updateDto);
      return this.mapToResponseDto(party);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Delete an external party',
    description: 'Deletes an external party if it has no associated accounts'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'External party ID (ULID)', 
    example: '01H5EXTERNAL123456789' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'External party deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'External party not found' 
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Cannot delete party with associated accounts' 
  })
  @Public()
  @Delete(':id')
  async deleteParty(@Param('id') id: string): Promise<void> {
    try {
      await this.externalPartyService.deleteParty(id);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  // =====================================
  // KYC Management Endpoints
  // =====================================

  @ApiOperation({ 
    summary: 'Update external party KYC status',
    description: 'Updates KYC status with workflow validation and audit trail'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'External party ID (ULID)', 
    example: '01H5EXTERNAL123456789' 
  })
  @ApiBody({
    type: UpdateKycStatusDto,
    description: 'KYC status update information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'KYC status updated successfully', 
    type: ExternalPartyResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid KYC transition or input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'External party not found' 
  })
  @Public()
  @Put(':id/kyc-status')
  async updateKycStatus(
    @Param('id') id: string, 
    @Body(ValidationPipe) updateDto: UpdateKycStatusDto
  ): Promise<ExternalPartyResponseDto> {
    try {
      const party = await this.externalPartyService.updateKycStatus(id, {
        newStatus: updateDto.newStatus as KycStatus,
        reason: updateDto.reason,
        notes: updateDto.notes
      });
      return this.mapToResponseDto(party);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Flag external party for compliance review',
    description: 'Flags a party for manual compliance review with specified reason'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'External party ID (ULID)', 
    example: '01H5EXTERNAL123456789' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for flagging the party',
          example: 'Suspicious transaction pattern detected'
        }
      },
      required: ['reason']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Party flagged for review successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'External party not found' 
  })
  @Public()
  @Post(':id/flag-review')
  async flagPartyForReview(
    @Param('id') id: string,
    @Body() body: { reason: string }
  ): Promise<{ message: string }> {
    try {
      await this.externalPartyService.flagPartyForReview(id, body.reason);
      return { message: 'Party flagged for review successfully' };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Bulk update KYC status for multiple parties',
    description: 'Updates KYC status for multiple parties in a single operation'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        partyIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of external party IDs',
          example: ['01H5EXTERNAL123456789', '01H5EXTERNAL987654321']
        },
        newStatus: {
          type: 'string',
          enum: ['verified', 'pending', 'blocked'],
          description: 'New KYC status for all parties',
          example: 'verified'
        },
        reason: {
          type: 'string',
          description: 'Reason for the bulk status change',
          example: 'Batch verification completed'
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the bulk operation',
          example: 'Processed through automated verification system'
        }
      },
      required: ['partyIds', 'newStatus', 'reason']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bulk KYC update completed', 
    type: BulkKycUpdateResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @Public()
  @Post('bulk/kyc-status')
  async bulkUpdateKycStatus(
    @Body() body: { 
      partyIds: string[], 
      newStatus: KycStatus, 
      reason: string, 
      notes?: string 
    }
  ): Promise<BulkKycUpdateResponseDto> {
    try {
      const result = await this.externalPartyService.bulkUpdateKycStatus(body);
      return {
        successful: result.successful,
        failed: result.failed,
        summary: {
          totalRequested: body.partyIds.length,
          successfulCount: result.successful.length,
          failedCount: result.failed.length
        }
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  // =====================================
  // Filtering and Specialized Endpoints
  // =====================================

  @ApiOperation({ 
    summary: 'Get external parties by type',
    description: 'Retrieves all external parties of a specific type'
  })
  @ApiParam({ 
    name: 'type', 
    description: 'External party type', 
    enum: ExternalPartyType,
    example: ExternalPartyType.CLIENT 
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20
  })
  @ApiResponse({ 
    status: 200, 
    description: 'External parties retrieved successfully', 
    type: PaginatedExternalPartiesResponseDto 
  })
  @Public()
  @Get('by-type/:type')
  async findByType(
    @Param('type') type: ExternalPartyType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ): Promise<PaginatedExternalPartiesResponseDto> {
    try {
      const result = await this.externalPartyService.findParties({ type }, { page, limit });
      return {
        data: result.data.map(party => this.mapToResponseDto(party)),
        pagination: result.pagination
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Get external parties by jurisdiction',
    description: 'Retrieves all external parties in a specific jurisdiction'
  })
  @ApiParam({ 
    name: 'jurisdiction', 
    description: 'ISO 3166-1 alpha-2 country code', 
    example: 'US' 
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
    example: 20
  })
  @ApiResponse({ 
    status: 200, 
    description: 'External parties retrieved successfully', 
    type: PaginatedExternalPartiesResponseDto 
  })
  @Public()
  @Get('by-jurisdiction/:jurisdiction')
  async findByJurisdiction(
    @Param('jurisdiction') jurisdiction: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ): Promise<PaginatedExternalPartiesResponseDto> {
    try {
      const result = await this.externalPartyService.findParties({ jurisdiction }, { page, limit });
      return {
        data: result.data.map(party => this.mapToResponseDto(party)),
        pagination: result.pagination
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Get parties requiring compliance review',
    description: 'Retrieves parties that require immediate compliance attention'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Parties requiring attention retrieved successfully', 
    type: PartiesRequiringAttentionDto 
  })
  @Public()
  @Get('compliance/requiring-attention')
  async getPartiesRequiringAttention(): Promise<PartiesRequiringAttentionDto> {
    try {
      const result = await this.externalPartyService.getPartiesRequiringAttention();
      return {
        blockedParties: result.blockedParties.map(party => this.mapToResponseDto(party)),
        pendingReview: result.pendingReview.map(party => this.mapToResponseDto(party)),
        missingCompliance: result.missingCompliance.map(party => this.mapToResponseDto(party))
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Get external party statistics',
    description: 'Retrieves comprehensive statistics about external parties for reporting'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully', 
    type: ExternalPartyStatisticsDto 
  })
  @Public()
  @Get('statistics/overview')
  async getPartyStatistics(): Promise<ExternalPartyStatisticsDto> {
    try {
      return await this.externalPartyService.getPartyStatistics();
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  // =====================================
  // Private Helper Methods
  // =====================================

  /**
   * Map ExternalParty to response DTO
   */
  private mapToResponseDto(party: ExternalParty): ExternalPartyResponseDto {
    return {
      externalId: party.id,
      name: party.name,
      type: party.type,
      jurisdiction: party.jurisdiction,
      kycStatus: party.kycStatus,
      relationshipStart: party.relationshipStart,
      notes: party.notes,
      createdAt: party.createdAt,
      updatedAt: party.updatedAt,
      typeRules: party.getTypeSpecificRules(),
      canHaveHighValueAccounts: party.canHaveHighValueAccounts(),
      recommendedActions: party.getRecommendedActions()
    };
  }

  /**
   * Handle service layer errors and convert to appropriate HTTP exceptions
   */
  private handleServiceError(error: any): never {
    if (error instanceof PartyNotFoundException) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
    
    if (error instanceof DuplicatePartyException) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
    
    if (error instanceof ValidationException) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
    if (error instanceof InvalidKycTransitionException) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
    if (error instanceof ComplianceViolationException) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (error instanceof AssociatedAccountsException) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // Handle database or other unexpected errors
    if (error.message?.includes('constraint')) {
      throw new HttpException('Database constraint violation', HttpStatus.BAD_REQUEST);
    }

    // Generic error fallback
    throw new HttpException(
      'Internal server error', 
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
