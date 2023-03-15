# NestJS Template
This is a NestJS template to build a standalone API.  It was originally built for a specific purpose (hence the Product Service label and entities) and done as part of an Nx monorepo.  This repo specifically is adapted to function on it's own and leaves in much of the original logic so that it could be used as a reference to build something else.

## Todo

* Docker - We aren't fully leveraging Docker yet.  We should be able to spin up the application alongside it's database and ideally want to be able to run all of our tests using these containers with a single command
* "Audit" Tests - One of the E2E tests has a working proof-of-concept to get all routes in the appllication.  We should be able to rebuild the E2E tests to check that all routes are versionied and all routes have swagger documentation
* Documentation - The steps in the documentation to recreate a brand new service haven't been tested since splitting off from the monorepo pattern.  It was all working before then, but should be checked again


# Product Service

### Built With

* [Nest.js](https://nestjs.org/)
* [Typeorm](https://typeorm.io)
* [Jest](https://jestjs.io/)

### Prerequisites
* yarn
* docker
* docker-compose


### Quick Start

To get the application up and running immediately, run the following commands from the root directory.

```
yarn install
docker compose --env-file .env.local up -d
yarn typeorm:cli migration:run
yarn start
```

This will create the docker container for the database if it doesn't exist, create the schema for product services, and run the server.

# Database Setup

## Setting up Postgres
The project is setup to use a Postgres container by default.  To install and start the container, from the root directory run
```
docker compose --env-file .env up -d 
```

This will start up a containerized Postgres instance with the values found in `.env`. To use an existing local instance of Postgres, simply update the application's `.env` to match your instance

## TypeORM CLI
All of our database setup is done via the TypeORM CLI.  The `package.json` includes a command that allows easy access to it:
```
yarn typeorm <args>
```
This alias starts by executing `identify-entities.ts` which looks for any entity files and updates `src/database/entities.ts` which will be imported by the data source. Then it runs the CLI through ts-node so we can natively read `.ts` files and is also preconfigured to use the datasource in `src/database/data-source.ts`.  Using the command without any arguments will show what commands are available.

## Running Migrations
Once your database is running and the schema has been created, we can setup our entitities using this command
```
yarn typeorm migration:run
```

This will apply all migrations from `src/database/migrations` to your database

## Other Database Commands
* `yarn identify-entities` - Searches for new Entity files and updates the module referenced by our data source.
* `yarn typeorm migration:revert` - Undo all applied migrations. This is the best way to reset your database
* `yarn typeorm migration:generate <path>` - Create a new migration to sync the database the next time migrations are run.  Necessary after any changes are made to Entities
* `yarn typeorm migration:create <path>` - Create an empty migration, useful for changes that will not be auto-detected such as DB Functions
* `yarn typeorm schema:sync` - Sync your database directly against your entities.  May miss any manually generated migrations
* `yarn typeorm schema:drop` - Drops the schema to start fresh.  May miss any manually generated migrations

The `migration` commands should be used whenever possible.  If something goes wrong while changing entities, the `schema` can help get your database back into a stable state.

# Running Tests

With packages installed and the databse running, you can verify that everything is working correctly by running the test suites

## Test Commands
* `yarn test` - runs all unit tests
* `yarn test:integration` - runs all `.integration` tests.  Requires a running instance of the DB and will verify that the database is setup correctly
* `yarn test:all` - runs both unit and integration tests.  E2E are excluded
* `yarn test:e2e` - runs only E2E tests.  Requires a running instance of the application (`yarn start` from another command prompt to test locally)

## Watch Mode
We have a separate command to quickly enter Jest's watch mode
```
yarn watch
```

This will start up watch mode with an invalid file match parameter (`"undefined"`) to prevent tests from running automatically.  This allows you to easily specify specific files or tests to quickly debug issues.

# Starting the Application

Before starting everything up, we'll need some test data to get something back from our requests.
```
yarn seed-data
```

This uses the same process that our tests use to seed test data.  It runs a fake test suite that seeds the database without the normal teardown step.  Since it's using the same process, running integration tests will also clear out these records after they finish so you may need to re-seed

Now we can start the application with
```
yarn start
```

If everything starts correctly you'll be able to make requests against `http://localhost:3000/api/product-services` with the appropriate version header

You can also see the current documentation at: http://localhost:3000/api/product-services/swagger/

# Hamster Services

To demonstrate how we can leverage the existing Product Services, we'll be using it to build a fun, fictional service to manage Hamsters.  This will both show how Product Services is setup, as well as showing how you can use it to build a whole new API.

If you're happy with having the application up and running and ready for dev work, you can stop reading here.

# Using Product Services as a Template

To build our own service based on Products Services, we'll start by copying over the existing `product-services` app into a new `hamster-services` directory and cleaning out the code that we won't be needing.

1. Nest Module - remove the `products`, `entitlements`, and `resources` folders from the `src` directory. In `src/app/app.module.ts` remove references to these deleted imports.
2. Database - remove migrations in the `src/database/migrations` and `src/database/test-migrations` directories. Replace the contents of `entities.ts` with `export default []`, this file will be updated automtically but may cause problems if it has broken imports.
3. Testing - In `src/testing/fixtures` remove fixtures for entitlements, products, and resources and remove the references in `index.ts`.  in `test/main.e2e-spec.ts` reset `versionedRoutes` to `{ hamsters: [] }`
4. App Name - replace all instances of `product-services` with `hamster-services` (or your service name) in `jest.config.js`, `seed-test-data.config.js`, `project.json`, and the `.env` files in the application root directory.  Also replace `product_services` as the DB schema with an appropriate snake_case value in the `.env` files.

# Generating Nest Components

To start, we'll be using the Nest CLI to generate the `Module`, `Controller`, and `Service` for our new entity.  For demonstration purposes, I will be creating an API to manage adorable Hamsters.  These components can be created by running these commands in order

(Note: it is recommended to use a plural name, ie `hamsters` instead of `hamster`, singular names are typically only used in the Entity and Dto files later on)
```
  nest generate module hamsters
  nest generate controller hamsters
  nest generate service hamsters
```
These will automatically create a new folder for your components, and as each command is run it will automatically connect your `Controller` and `Service` to the new `Module`.

The Nest CLI has connected some of these components together, but there's still a few steps we need to do to make sure everything is setup.

We can connect our `Service` to the `Controller` by importing it into the `Controller` and adding this constructor
```ts
  constructor(private readonly hamstersService: HamstersService) {}
```

Finally we need to import our `Module` into our `AppModule` in `src/app/app.module.ts` by importing it and adding into the `@Module` decorator's import property
```ts
  imports: [
    ...
    HamstersModule
  ]
```

# Creating Data Objects

## Entity

Nestjs comes with a lot of support for TypeORM which is what we'll be using.  To start, we need to define our schema with an `Entity` file.  In our `hamsters` directory we'll add a new file 

```ts
// src/hamsters/hamster.entity.ts
import { Expose } from 'class-transformer'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity({ name: 'hamsters' })
export class Hamster {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  id: number

  @Column('varchar')
  name: string

  @Column('varchar')
  description: string

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose({ name: 'created_at'})
  createdAt: Date
}
```

This will give us a very basic schema with a sequential ID, a little information abour our hamster, and an auto-generated created time so we know our fuzzy friend's birthday.  For the decorators, we also have a demonstration on how to define a custom table name in the `@Entity()` decorator and how to specify basic column types.

## Dtos

Data transfer object (DTO) objects are used to represent what incoming and outgoing data will look like.  You can structure these however you like.  For demonstration purposes I will be using a "plain" Dto to represent what the data will look like in an outgoing response, and a `Create` and `Update` dto to represent an incoming `POST` and `PATCH` request body.  We'll also be using a common `ChangeHamsterDto` and exporting it as two separate objects.  This allows us to have cleaner, common, code in the short term and make it easier for these objects to diverge in the future if needed.   These will be in a new `/hamsters/dtos` directory.

```ts
// src/hamsters/dtos/hamster.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'

export class HamsterDto {
  @ApiProperty({
    description: 'Hamster ID',
    example: 1
  })
  @Expose()
  id: number

  @ApiProperty({
    description: `Hamster's name`,
    example: `Boo`
  })
  @Expose()
  name: string

  @ApiProperty({
    description: 'Important details about our fluffy friend',
    example: 'Go for the eyes Boo, GO FOR THE EYES!!'
  })
  @Expose()
  description: string

  @ApiProperty({
    name: 'created_at',
    description: 'ISO string when the Hamster was created',
    example: '2022-6-05T14:48:00.000Z'
  })
  @Expose({ name: 'createdAt'})
  @Transform(({ value }) => value.toISOString())
  created_at: string
}
```

```ts
// src/hamsters/dtos/change-hamster.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

class ChangeHamsterDto {
  @ApiProperty({
    description: `Hamster's name`,
    example: `Boo`
  })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({
    description: 'Important details about our fluffy friend',
    example: 'Go for the eyes Boo, GO FOR THE EYES!!'
  })
  @IsString()
  @IsOptional()
  description?: string
}

export class CreateHamsterDto extends ChangeHamsterDto {}
export class UpdateHamsterDto extends ChangeHamsterDto {}
```

```ts
// src/hamsters/dtos/index.ts
export { HamsterDto } from './hamster.dto'
export { CreateHamsterDto } from './change-hamster.dto'
export { UpdateHamsterDto } from './change-hamster.dto'
```

A few important details from the examples above:

- The `@Expose()` decorators are needed to handle the transformations back and forth between objects.  They are necessary in the outgoing `HamsterDto`.  In the incoming Dtos they are optional but can set additional flags for transformations.
- We're using a mix of snake_case and camelCase.  This is by design and let's Nest automatically convert into different naming conventions where appropriate.  The `@Expose()` decorator informs what format we expect when converting into this object.  Our outgoing `HamsterDto` will be created from the camelCase Entity.  Our incoming `CreateHamsterDto` and `UpdateHamsterDto` will be created from a snake_case `HttpRequest`
- Input validation is handled by `class-validator` decorators.  In this case `@IsString()` checks that the value is string.  When combined with `@IsOptional()` it will allow the field to be omitted, but must pass `@IsString()` if it is included.
- The `@ApiProperty()` decorator provides swagger details for our objects.  `description` and `example` should be provided for all fields, `name` is only necessary if the property name in code is camelCase

# Connecting to the Database

Now that we have our data objects in place, we need sync our database with the schema represented in code.  If your database isn't already running, you can find instructions on how to do so earlier in this document.

## TypeORM Migration

With the database running, we can create the schema from our `Entity` file by running these commands

```
  yarn typeorm migration:generate --name=bootstrap
  yarn typeorm migration:run
```

These will create the schema in our database, create a new migration in `src/database/migrations` named `bootstrap`, and then apply it to our brand new schema. 

## Setting up the Repository

We need to make two changes to our `Module` and `Service` to finish setting up our connection to the database.

```ts
// src/hamsters/hamsters.module.ts
...
import { TypeOrmModule } from '@nestjs/typeorm'
import { Hamster } from './hamster.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Hamster])],
  ...
})
...
```

```ts
// src/hamsters/hamsters.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { extendRepo, IExtendedRepository } from '../database/extend-repo'
import { Hamster } from './hamster.entity'

@Injectable()
export class HamstersService {
  constructor(@InjectRepository(Hamster) private repo: IExtendedRepository<Hamster>) {
    this.repo = extendRepo(this.repo, Hamster)
  }
}
```

In the `Module` we are telling nest to bring in TypeORM functionality for our `Hamster` entity.  In the `Service` we are asking nest to provided us with a configured `Repository` for our entity.  The constructor and definition of `IExtendedRepository` are custom code that's adding new functions to the default TypeORM `Repository` class. 

# Testing the Database

## Fixtures

Test data is handled by our `Fixture` classes.  An example fixture can be found in `src/testing/fixtures/example`.  We can copy this `user.fixture.ts` up one level into the base `fixtures` directory and start updaing it to match our Hamster objects.

Quick breakdown on what should go in each variable
 - `data` - A set of `key: Entity` pairs in plain JSON. These can represent existing data or what an entity will look like after changes are made
 - `entityKeysToSeed` - Which of your `data` objects should be used to populate the database, in the test case we are only included one object and using the other two only to check expected results
 - `requestDtos` - these are Dto objects used as inputs for CRUD operations.  These are also keyed for easy access.  At the top of the file is an optional custom type to make autocompletion available when writing tests.
 - `errors` - a list of errors that will be returned by your controller and service.  This helps ensure error messages are kept consistent with the code and all tests.
 - `toDto` - this is an optional method that will be attached to your `data` and should roughly outline the process to convert an `Entity` into the `HamsterDto`.  DO NOT DUPLICATE THS CODE.  This process should not be copied to or from elsewhere in the project.  Doing so will risk replicating a bug from your actual code in your tests.  There is a default implementation that works for many cases, but can be overriden if needed.

 When everything is completed you should have something like this
 ```ts
 // src/testing/fixtures/hamsters.fixture.ts
 import { BaseFixture, DataItem } from './base.fixture'
 import { NotFoundException } from '@nestjs/common'
 import { Hamster } from '../../hamsters/hamster.entity'
 import { HamsterDto, CreateHamsterDto, UpdateHamsterDto } from '../../hamsters/dtos'
 
 type HamsterDtos = {
   createHamsterDto: CreateHamsterDto,
   updateHamsterDto: UpdateHamsterDto
 }
 
 export class HamstersFixture extends BaseFixture<Hamster, HamsterDto>  {
   constructor() {
     super(Hamster)
     this.initialize()
   }
 
   public entityKeysToSeed: string[] = ['testHamster']
   public data: { [key: string]: DataItem<Hamster, HamsterDto>} = {
     testHamster: {
       id: 1,
       name: 'Boo',
       description: 'Go for the eyes Boo, GO FOR THE EYES!!',
       createdAt: new Date('1/1/2020')
     },
     createdHamster: {
       id: expect.anything(),
       name: 'Floof Nugget',
       description: 'maximum floof',
       createdAt: expect.anything()
     },
     updatedHamster: {
       id: 1,
       name: 'Boo',
       description: 'We are all heroes: You and Boo and I. Hamsters and rangers everywhere! Rejoice!',
       createdAt: new Date('1/1/2020')
     }
   }
 
   public requestDtos: HamsterDtos = {
     createHamsterDto: {
       name: 'Floof Nugget',
       description: 'maximum floof',
     },
     updateHamsterDto: {
       description: 'We are all heroes: You and Boo and I. Hamsters and rangers everywhere! Rejoice!',
     }
   }
 
   public errors: { [key: string]: Error } = {
     notFound: new NotFoundException('hamster not found')
   }
 }
```

This should also be exported in the `index.ts`
```ts
export { HamstersFixture } from './hamsters.fixture'
```

## Setting up Integration Tests

To write our first tests, we'll start by creating a new `test` directory in `src/hamsters`.  Next we'll move all of the  `spec.ts` into and make a copy of `hamsters.service.spec.ts` that will be renamed to `hamsters.service.integration.spec.ts`.  Then open the new `integration.spec` file to start writing our integration tests.

Since these tests are going to run against our actual database, we need to setup the testing module the same way we setup the actual modulde by adding this into the `createTestingModule()` configuration
```ts
import { TypeOrmModule } from '@nestjs/typeorm'
import { Hamster } from '../hamster.entity'
import { dbConfig } from '../../database/data-source'
...
      imports: [
        TypeOrmModule.forRoot(dbConfig),
        TypeOrmModule.forFeature([Hamster])
      ],
```

Then we'll need to setup hooks to create and clear test data between each of our tests
```ts
import { TestUtil } from '../../testing/util'
...
  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })
```

Next is to make sure our data has been cleared and the connection to the database closed after all of our tests have finished.
```ts
  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await module.close()
  })
```

We also want to bring in our `HamstersFixture`.  I also like to use object destructuring to setup which data objects I plan to use in my tests.
```ts
import { HamstersFixture } from '../../testing/fixtures/'
...
describe('HamstersService', () => {
  const hamstersFixture = new HamstersFixture()
  const { testHamster } = hamstersFixture.data
...
```

Finally, the testing module is not in scope to close the connection so we need to expose it at the top of our `describe()` block
```ts
  ...
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
  ...

```

When everything is finished we should have something that looks like this
```ts
// src/hamsters/hamsters.service.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HamstersService } from '../hamsters.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Hamster } from '../hamster.entity'
import { dbConfig } from '../../database/data-source'
import { TestUtil } from '../../testing/util'
import { HamstersFixture } from '../../testing/fixtures/'

describe('HamstersService', () => {
  const hamstersFixture = new HamstersFixture()
  const { testHamster } = hamstersFixture.data
  let service: HamstersService;
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbConfig),
        TypeOrmModule.forFeature([Hamster])
      ],
      providers: [HamstersService],
    }).compile();

    service = module.get<HamstersService>(HamstersService);
  });

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await module.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
```

## Our First Test

Since the test that came with doesn't really help us, we're going replace it with a new integration test that will connect to the database.

```ts
  describe('getById()', () => {
    it('should return a Hamster by id', async () => {
      await expect(service.getById(testHamster.id))
              .resolves.toEqual(testHamster.toEntity())
    })
  })
```

And the matching implementation in our `Service`
```ts
  async getById(id: number): Promise<Hamster> {
    const hamster = id ? await this.repo.findOneBy({ id }) : null
    if (!hamster) {
      throw new NotFoundException('hamster not found')
    }
    return hamster
  }
```

Now we can run our test and should see one passing test
```
  yarn test:integration
```

Note: you can also use Jest's watch mode for this and future tests.  Using the file match option and specifying `hamsters.service.int` would filter out all other tests except this new integration test suite.  Details on it's use are above in the testing section.

Our final test file should look like this
```ts
//src/hamsters/tests/hamster.service.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { HamstersService } from '../hamsters.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Hamster } from '../hamster.entity'
import { dbConfig } from '../../database/data-source'
import { TestUtil } from '../../testing/util'
import { HamstersFixture } from '../../testing/fixtures/'

describe('HamstersService', () => {
  const hamstersFixture = new HamstersFixture()
  const { testHamster } = hamstersFixture.data
  let service: HamstersService;
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbConfig),
        TypeOrmModule.forFeature([Hamster])
      ],
      providers: [HamstersService],
    }).compile()

    service = module.get<HamstersService>(HamstersService)
  });

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await module.close()
  })

  describe('getById()', () => {
    it('should return a Hamster by id', async () => {
      await expect(service.getById(testHamster.id)).resolves.toEqual(testHamster.toEntity())
    })
  })
})
```

# Unit Tests

Integration tests are a great way to verify that the actual architecture you're trying to build is working.  These tests can also take a long time to run and you may not want to run them that often.  It's also harder to check for errors and edge cases since you have to actually set up your databse.

To address these concerns, we're going to also add some unit tests to the `hamsters.service.spec.ts` that we copied before to build our integration tests.

Since the service is expecting a `Repository`, we need to provide a Mocked version of the repository to simulate our database with one of our test utilities.  This function returns an array of Mock providers that nest will use to supply a repository.
```ts
import { TestUtil } from '../../testing/util'
import { Hamster } from '../hamster.entity'
...
      providers: [
        HamstersService,
        ...TestUtil.mockRepositories([Hamster])
      ],
```

We also need to get a copy of the repository to simulate database operations in our tests.  It's also not a bad idea to get our Fixture setup as well.
```ts
import { IExtendedRepository } from '../../database/extend-repo'
import { HamstersFixture } from '../../testing/fixtures/'
...
describe('HamstersService', () => {
  const hamstersFixture = new HamstersFixture()
  const { testHamster } = hamstersFixture.data
  let service: HamstersService
  let repo: IExtendedRepository<Hamster>
  
  beforeEach(async () => {
    ...
    service = module.get<HamstersService>(HamstersService)
    repo = module.get(getRepositoryToken(Hamster))
  })
```

At this point it should look like

```ts
// src/hamsters/tests/hamsters.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { IExtendedRepository } from '../../database/extend-repo'
import { TestUtil } from '../../testing/util'
import { Hamster } from '../hamster.entity'
import { HamstersService } from '../hamsters.service'
import { HamstersFixture } from '../../testing/fixtures/'

describe('HamstersService', () => {
  const hamstersFixture = new HamstersFixture()
  const { testHamster } = hamstersFixture.data
  let service: HamstersService
  let repo: IExtendedRepository<Hamster>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HamstersService,
        ...TestUtil.mockRepositories([Hamster])
      ],
    }).compile()

    service = module.get<HamstersService>(HamstersService)
    repo = module.get(getRepositoryToken(Hamster))
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  })
})
```

Now we can add in a unit test to verify our service is calling the repository as expected
```ts
  describe('getById()', () => {
    it('should return a Hamster by id', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testHamster.toEntity())
      await expect(service.getById(testHamster.id)).resolves.toEqual(testHamster.toEntity())
    })
  })
```

If we run our unit tests, we should our new test passing along with most of the existing unit tests.  We'll address the controller unit tests soon.
```
  yarn test
```

# Creating the Controller

Most of the `Controller` is already setup for us using the nest CLI.  Here's what we'll end up with after adding route to use the `Service` function we've created

```ts
// src/hamsters/hamsters.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { Serialize } from '../interceptors/serialize.interceptor'
import { HamsterDto } from './dtos'
import { HamstersService } from './hamsters.service'

@Serialize(HamsterDto)
@Controller({ path: 'hamsters', version: '1' })
export class HamstersController {
  constructor(private readonly hamstersService: HamstersService) {}

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    console.log(id)
    return this.hamstersService.getById(id)
  }
}
```

As you can see, most of the routing is handled using decorators
- `@Get(':id')` indicates this should be called with a `GET` request, and the string we pass in is the endpoint we want to use.  This will also be compined with the contents of the `@Controller()` decorator.  So our final endpoint will be `/hamsters/:id`
- `@Param()` tells nest to extract this parameter from our route parameters and `ParseIntPipe` converts it from the raw string to a number
- `@Serialize()` is a custom interceptor of ours that will automatically convert the `Hamster` entities returned from the controller into `HamsterDto` for the response body

## Unit Tests

Controller level tests are an odd case.  Since Nest is doing all of the routing behind the scenes we can't actually test that our routes are working with these tests which means they only provide a little bit of confidence in your application.

We'll be including them here just to prove that they're returning the result of the service.  The only difference between the `Controller` and `Services` tests are mocking the `Service` rather than the `Repository`

```ts
// src/hamsters/tests/hamsters.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { HamstersFixture } from '../../testing/fixtures'
import { TestUtil } from '../../testing/util'
import { HamstersController } from '../hamsters.controller'
import { HamstersService } from '../hamsters.service'

describe('HamstersController', () => {
  const hamstersFixture = new HamstersFixture()
  const { testHamster } = hamstersFixture.data
  let controller: HamstersController;
  let service: HamstersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HamstersController],
      providers: TestUtil.mockProviders([HamstersService])
    }).compile();

    controller = module.get<HamstersController>(HamstersController);
    service = module.get<HamstersService>(HamstersService)
  });

  // GET /products/:id
  describe('getById()', () => {
    it('should return the result from service', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(testHamster.toEntity())
      await expect(controller.getById(testHamster.id)).resolves.toEqual(testHamster.toEntity())
    })
  })
})
```

# Integration Tests

With all of our code in place to power our endpoint, it's time to prove it actually works with an actual web request.  In other APIs these would be considered End to End (E2E) tests.  With Nest, we're setting a test instance of our `AppModule` that we can send requests to using `supertest`.  Any middleware in `src/main.ts` that's being applied to our live server needs to be tested separately, which is why we make this distinction between the `Controller` integration tests and true E2E tests.

Our test file will look a lot like the `service.integration` tests, except that we are using supertest to run through our code.
```ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { HamsterFixture } from '../src/testing/fixtures'
import { TestUtil } from '../src/testing/util'
import { StatusCodes } from 'http-status-codes'

describe('Product Controller', () => {
  const hamstersFixture = new HamsterFixture()
  const { testHamster } = hamstersFixture.data
  const { OK } = StatusCodes
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  beforeEach(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.createTestDbRecords()
  })

  afterAll(async () => {
    await TestUtil.deleteTestDbRecords()
    await TestUtil.teardownTestDb()
    await app.close()
  })

  describe('GET /hamsters/:id', () => {
    it('should return OK and a Hamster', async () => {
      const response = await request(app.getHttpServer())
        .get(`/hamsters/${testHamster.id}`)
        .expect(OK)
  
      expect(response.body).toEqual(testHamster.toDto())
    })
  })
})
```

We should see all of our integration tests passing with
```
yarn test:integration
```

# End to End (E2E) Tests

Our E2E tests covers all of the logic in `src/main.ts` which includes things like versioning, swagger documentation, and datadog integration.  Many of the tests for product services will also work here with a few small changes.

In `main.ts` we need to set a new `globalPrefix`
```ts
  const globalPrefix = '/api/hamster-services'
```

Then in `test/main.e2e-spec.ts` we need to update the global `routePrefix` to match
```ts
  const routePrefix = '/api/hamster-services'
```

And configure our `versionedRoutes` to check that our first endpoint is looking for a version header
```ts
  const versionedRoutes = {
    hamsters: [
      new VersionedRoute('GET', '/hamsters/-1', '1'),
    ]
  }
```

Running E2E tests is a little different than our other tests since we aren't using Nest's testing modules.  Instead in a new command prompt start the server with
```
yarn start
```

And in our original command prompt
```
yarn test:e2e
```

We should get back two passing tests

# Next Steps

If you've been following along you should now have a fully functioning and fully tested application (albeit a very basic one).  From here you can go back and implement/test the remaining endpoints and CRUD operations for whichever Entity you chose to start with.

And while we have tests to prove our one and only endpoint is working all the way from the browser down to the database, we've only tested our "ideal" scenario.  Now would be a good time to go back and add some additional tests for what happens when we can't find our beloved Hamster.
 