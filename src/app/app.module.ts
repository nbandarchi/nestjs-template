import { BadRequestException, Module, ValidationError, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
// import { HealthModule } from '../health/health.module'
import { ProductsModule } from '../products/products.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dbConfig } from '../database/data-source'
import { ResourcesModule } from '../resources/resources.module'
import { EntitlementsModule } from '../entitlements/entitlements.module'
import { snakeCase } from 'snake-case'
@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    // DatadogModule,
    /// HealthModule,
    // Modules must be imported with the Products Module last otherwise sub-domain routes will fail.
    EntitlementsModule,
    ResourcesModule,
    ProductsModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
          const messages = []
          errors.forEach(error => {
            messages.push(...Object.values(error.constraints).map(constraint => {
              return constraint.replace(error.property, snakeCase(error.property))
            }))
          })
          return new BadRequestException(messages)
        }
      })
    }
  ]
})
export class AppModule {}
