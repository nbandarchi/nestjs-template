import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductsController } from './products.controller'
import { ProductViewsController } from './product-views.controller'
import { ProductsService } from './products.service'
import { Product } from './product.entity'
import { Entitlement } from '../entitlements/entitlement.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Product]), TypeOrmModule.forFeature([Entitlement])],
  controllers: [ProductsController, ProductViewsController],
  providers: [ProductsService]
})
export class ProductsModule {}
