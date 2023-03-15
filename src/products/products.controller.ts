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
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CreateProductDto, ProductDto, UpdateProductDto } from './dtos'
import { ProductsService } from './products.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { StatusCodes } from 'http-status-codes'
import { ApiPagedResponse } from '../decorators/api-paged-response.decorator'
import { LastModified } from '../interceptors/last-modified.interceptor'
import { FromRequest } from '../decorators/from-request.decorator'
import { GetProductDto } from './dtos/get-product.dto'
import { PagingRequest } from '../decorators/paging-request.decorator'
import { Paging} from '../common/paging'

@ApiTags('products')
@Controller({ path: 'products', version: '1' })
@Serialize(ProductDto)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @ApiPagedResponse(ProductDto)
  @LastModified()
  @ApiQuery({
    name: 'withEntitlements',
    description: 'Response payload with entitlements',
    type: 'boolean',
    required: false
  })
  async findAll(
    @FromRequest({ dto: GetProductDto, blacklistFields: ['id' ]}) dto: GetProductDto,
    @PagingRequest() paging: Paging,
  ) {
    const results = await this.productsService.findAll(dto, paging)
    if (dto.withEntitlements) {
      results[0].forEach(result => {
        delete result.entitlementIds
      })
    }
    return results
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductDto })
  @LastModified()
  @ApiQuery({
    name: 'withEntitlements',
    description: 'Response payload with entitlements',
    type: 'boolean',
    required: false
  })
  async findById(
    @FromRequest({ dto: GetProductDto, whitelistFields: ['id', 'withEntitlements']}) dto: GetProductDto,
  ) {
    const result = await this.productsService.getById(dto)
    if (dto.withEntitlements) {
      delete result.entitlementIds
    }
    return result
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({ type: ProductDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Post()
  @ApiCreatedResponse({ type: ProductDto })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Delete(':id')
  @HttpCode(StatusCodes.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Product ID' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.delete(id)
  }
}
