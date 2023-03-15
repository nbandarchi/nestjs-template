import { INestApplication, Logger, VersioningType } from '@nestjs/common'
//import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
//import { environment } from './environments/environment'
import { config } from './config'

const globalPrefix = '/api/product-services'

export async function prepareApp(app: INestApplication) {
  app.setGlobalPrefix(globalPrefix)
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'version',
  })

  const config = new DocumentBuilder()
    .setTitle('Product Services')
    .setDescription('Product Services API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(`${globalPrefix}/swagger`, app, document)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, config.nestAppConfig)
  prepareApp(app)
  const port = process.env.PORT || 3000
  await app.listen(port, () => {
    Logger.log(`Listening at http://localhost:${port}${globalPrefix}`)
  })
}

bootstrap()
