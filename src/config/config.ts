import { LogLevel } from '@nestjs/common'
import 'dotenv/config'
import { assertEnv, assertNumber, assertEnum, assertBoolean } from './config-validator'

export class Config {
  constructor() {
    this.init()
  }

  public init() {
    this.nodeEnv = assertEnum<Env>(assertEnv('NODE_ENV'), Env)

    const logger = assertEnv('LOG_LEVELS', 'log,error,warn,debug').split(',') as LogLevel[]
    logger.forEach(log => assertEnum(log, _LogLevel))
    this.nestAppConfig = {
      cors: assertBoolean(assertEnv('CORS_IS_ENABLED', 'false')),
      logger
    }

    this.postgres = {
      host: assertEnv('POSTGRES_HOST'),
      port: assertNumber(assertEnv('POSTGRES_PORT')),
      user: assertEnv('POSTGRES_USER'),
      password: assertEnv('POSTGRES_PASSWORD'),
      database: assertEnv('POSTGRES_DB'),
      schema: assertEnv('POSTGRES_SCHEMA')
    }

    this.paging = {
      maxLimit: assertNumber(assertEnv('PAGING_MAX_LIMIT', '50'))
    }
  }

  public nodeEnv: Env
  public nestAppConfig: NestAppConfig
  public postgres: Postgres
  public paging: Paging
}

export enum Env {
  Development = 'development',
  Test = 'test',
  Production = 'production'
}

enum _LogLevel {
  Log = 'log',
  Error = 'error',
  Warn = 'warn',
  Debug = 'debug',
  Verbose = 'verbose'
}

type NestAppConfig = {
  cors: boolean,
  logger: LogLevel[]
}

type Postgres = {
  host: string
  port: number
  user: string
  password: string
  database: string
  schema: string
}

type Paging = {
  maxLimit: number
}