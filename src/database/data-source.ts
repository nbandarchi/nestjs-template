import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from '../config'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import * as entities from './entities'

export const dbConfig: any = {
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
  entities,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
}

const cliConfig: DataSourceOptions = {
  ...dbConfig,
  migrations: ['src/database/migrations/*.ts', 'database/migrations/*.js'],
  cli: {
    migrationsDir: 'src/database/migrations'
  }
}

const myDataSource = new DataSource(cliConfig)

export default myDataSource
