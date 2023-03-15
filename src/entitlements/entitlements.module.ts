import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EntitlementViewsController } from './entitlement-views.controller'
import { EntitlementsController } from './entitlements.controller'
import { EntitlementsService } from './entitlements.service'
import { Entitlement } from './entitlement.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Entitlement])],
  controllers: [EntitlementViewsController, EntitlementsController],
  providers: [EntitlementsService],
})
export class EntitlementsModule {}
