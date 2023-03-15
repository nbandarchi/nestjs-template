import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { EntitlementsService } from './entitlements.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { Resource } from '../resources/resource.entity'
import { ResourceDto } from '../resources/dtos'

@ApiTags('entitlements')
@Controller({ path: 'products/entitlements', version: '1' })
@ApiBearerAuth()
export class EntitlementViewsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Get(':id/resources')
  @Serialize(ResourceDto)
  @ApiOkResponse({ type: ResourceDto, isArray: true })
  findResourcesById(@Param('id', ParseIntPipe) id: number): Promise<[Resource[], Number]> {
    return this.entitlementsService.getResourcesById(id)
  }
}
