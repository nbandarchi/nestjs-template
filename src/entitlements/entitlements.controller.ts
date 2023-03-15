import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { EntitlementsService } from './entitlements.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { CreateEntitlementDto, EntitlementDto, UpdateEntitlementDto } from './dtos'
import { Entitlement } from './entitlement.entity'
import { StatusCodes } from 'http-status-codes'
import { ApiPagedResponse } from '../decorators/api-paged-response.decorator'
import { Paging } from '../common/paging'
import { PagingRequest } from '../decorators'

@ApiTags('entitlements')
@Controller({ path: 'products/entitlements', version: '1' })
@Serialize(EntitlementDto)
@ApiBearerAuth()
export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Get()
  @ApiPagedResponse(EntitlementDto)
  findAll(@PagingRequest({ limitOverride: 100 }) paging: Paging): Promise<[Entitlement[], Number]> {
    return this.entitlementsService.findAll(paging)
  }

  @Post()
  @ApiCreatedResponse({ type: EntitlementDto })
  create(@Body() dto: CreateEntitlementDto): Promise<Entitlement> {
    return this.entitlementsService.create(dto)
  }

  @Get(':id')
  @ApiOkResponse({ type: EntitlementDto })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Entitlement> {
    return this.entitlementsService.getById(id)
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Entitlement ID' })
  @ApiOkResponse({ type: EntitlementDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntitlementDto
  ): Promise<Entitlement> {
    return this.entitlementsService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(StatusCodes.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Entitlement ID' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.entitlementsService.delete(id)
  }
}
