
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
  HttpException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { LegalEntityService, EntityNotFoundException, InvalidHierarchyException, DuplicateEntityException, DependentEntitiesException, ValidationException } from '../services/legal-entity.service';
import { CreateLegalEntityDto } from '../dto/create-legal-entity.dto';
import { UpdateLegalEntityDto } from '../dto/update-legal-entity.dto';
import { QueryLegalEntitiesDto } from '../dto/query-legal-entities.dto';
import { LegalEntityResponseDto, PaginatedLegalEntitiesResponseDto } from '../dto/legal-entity-response.dto';
import { LegalEntity } from '../entities/legal-entity.entity';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Legal Entities')
@Controller('api/legal-entities')
export class LegalEntityController {
  constructor(private readonly legalEntityService: LegalEntityService) {}

  @ApiOperation({ 
    summary: 'Create a new legal entity',
    description: 'Creates a new legal entity with automatic capability assignment based on entity type'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Legal entity created successfully', 
    type: LegalEntityResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data or validation error' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Parent entity not found (for branch entities)' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Entity with same name and country already exists' 
  })
  @Public()
  @Post()
  async createEntity(@Body() createDto: CreateLegalEntityDto): Promise<LegalEntityResponseDto> {
    try {
      const entity = await this.legalEntityService.createEntity(createDto);
      return this.mapToResponseDto(entity);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'List legal entities with filtering and pagination',
    description: 'Retrieves a paginated list of legal entities with optional filtering by country, type, and capabilities'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of legal entities retrieved successfully', 
    type: PaginatedLegalEntitiesResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid query parameters' 
  })
  @Public()
  @Get()
  async findEntities(@Query() queryDto: QueryLegalEntitiesDto): Promise<PaginatedLegalEntitiesResponseDto> {
    try {
      const result = await this.legalEntityService.findEntities(queryDto);
      return {
        data: result.data.map(entity => this.mapToResponseDto(entity)),
        pagination: result.pagination
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Get a specific legal entity by ID',
    description: 'Retrieves detailed information about a specific legal entity'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Legal entity ID (ULID)', 
    example: '01H5EXAMPLE1234567890' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Legal entity retrieved successfully', 
    type: LegalEntityResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Legal entity not found' 
  })
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<LegalEntityResponseDto> {
    try {
      const entity = await this.legalEntityService.findById(id);
      return this.mapToResponseDto(entity);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Update a legal entity',
    description: 'Updates an existing legal entity with the provided data'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Legal entity ID (ULID)', 
    example: '01H5EXAMPLE1234567890' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Legal entity updated successfully', 
    type: LegalEntityResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Legal entity not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Entity with same name and country already exists' 
  })
  @Public()
  @Put(':id')
  async updateEntity(
    @Param('id') id: string, 
    @Body() updateDto: UpdateLegalEntityDto
  ): Promise<LegalEntityResponseDto> {
    try {
      const entity = await this.legalEntityService.updateEntity(id, updateDto);
      return this.mapToResponseDto(entity);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Delete a legal entity',
    description: 'Deletes a legal entity if it has no dependent entities'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Legal entity ID (ULID)', 
    example: '01H5EXAMPLE1234567890' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Legal entity deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Legal entity not found' 
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Cannot delete entity with dependent entities' 
  })
  @Public()
  @Delete(':id')
  async deleteEntity(@Param('id') id: string): Promise<void> {
    try {
      await this.legalEntityService.deleteEntity(id);
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  @ApiOperation({ 
    summary: 'Get child entities (branches) of a legal entity',
    description: 'Retrieves all direct child entities (branches) of the specified legal entity'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Parent legal entity ID (ULID)', 
    example: '01H5EXAMPLE1234567890' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Child entities retrieved successfully', 
    type: [LegalEntityResponseDto] 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Parent legal entity not found' 
  })
  @Public()
  @Get(':id/children')
  async findChildren(@Param('id') id: string): Promise<LegalEntityResponseDto[]> {
    try {
      const children = await this.legalEntityService.getEntityChildren(id);
      return children.map(entity => this.mapToResponseDto(entity));
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  /**
   * Map LegalEntity to response DTO
   */
  private mapToResponseDto(entity: LegalEntity): LegalEntityResponseDto {
    return {
      entityId: entity.id,
      name: entity.name,
      country: entity.country,
      entityType: entity.entityType,
      timezone: entity.timezone,
      regulatoryScope: entity.regulatoryScope,
      parentEntityId: entity.parentEntityId,
      canHostAccounts: entity.canHostAccounts,
      canHostWallets: entity.canHostWallets,
      canHostFxNodes: entity.canHostFxNodes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  /**
   * Handle service layer errors and convert to appropriate HTTP exceptions
   */
  private handleServiceError(error: any): never {
    if (error instanceof EntityNotFoundException) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
    
    if (error instanceof DuplicateEntityException) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
    
    if (error instanceof ValidationException) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
    if (error instanceof InvalidHierarchyException) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
    if (error instanceof DependentEntitiesException) {
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
