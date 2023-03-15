import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { EntitlementDto } from '../entitlements/dtos'

@ApiTags('products')
@Controller({ path: 'products', version: '1' })
@ApiBearerAuth()
export class ProductViewsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id/entitlements')
  @Serialize(EntitlementDto)
  @ApiOkResponse({ type: [EntitlementDto] })
  findEntitlementsById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findEntitlementsById(id)
  }
}
