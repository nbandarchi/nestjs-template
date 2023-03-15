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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { CreateResourceDto, ResourceDto, UpdateResourceDto } from './dtos'
import { ResourcesService } from './resources.service'
import { Serialize} from '../interceptors/serialize.interceptor'
import { StatusCodes } from 'http-status-codes'
import { ApiPagedResponse } from '../decorators/api-paged-response.decorator'
import { Paging } from '../common/paging'
import { PagingRequest } from '../decorators'

@ApiTags('resources')
@Controller({ path: 'products/resources', version: '1' })
@Serialize(ResourceDto)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiPagedResponse(ResourceDto)
  findAll(@PagingRequest() paging: Paging) {
    return this.resourcesService.findAll(paging)
  }

  @Get(':id')
  @ApiOkResponse({ type: ResourceDto })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.getById(id)
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiOkResponse({ type: ResourceDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, dto)
  }

  @Post()
  @ApiCreatedResponse({ type: ResourceDto })
  create(@Body() dto: CreateResourceDto) {
    return this.resourcesService.create(dto)
  }

  @Delete(':id')
  @HttpCode(StatusCodes.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Resource ID' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.resourcesService.delete(id)
  }
}
