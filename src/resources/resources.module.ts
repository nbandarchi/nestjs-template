import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ResourcesController } from './resources.controller'
import { ResourcesService } from './resources.service'
import { Resource } from './resource.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourcesController],
  providers: [ResourcesService]
})
export class ResourcesModule {}
