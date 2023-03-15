import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { BaseFixture, DataItem } from './base.fixture'
import { EntitlementDto, CreateEntitlementDto, UpdateEntitlementDto } from '../../entitlements/dtos'
import { Entitlement } from '../../entitlements/entitlement.entity'

type EntitlementDtos = {
  createEntitlementDto: CreateEntitlementDto,
  updateEntitlementDto: UpdateEntitlementDto
}

export class EntitlementsFixture extends BaseFixture<Entitlement, EntitlementDto>  {
  constructor() {
    super(Entitlement)
    this.initialize()
  }

  public entityKeysToSeed: string[] = ['testEntitlement', 'testEntitlement2']
  public data: { [key: string]: DataItem<Entitlement, EntitlementDto> } = {
    testEntitlement: {
      id: 1,
      name: 'Therapy',
      servicePeriodDays: 30,
      quantityPerPeriod: 1,
      resourceIds: [1],
      regionIds: [],
      insuranceEnabledFor: [],
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: new Date('2022-06-08T18:22:24.124Z'),
      deletedAt: null
    },
    testEntitlement2: {
      id: 2,
      name: 'Karate',
      servicePeriodDays: 30,
      quantityPerPeriod: 1,
      resourceIds: [2],
      regionIds: [],
      insuranceEnabledFor: [],
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: new Date('2022-06-08T18:22:24.124Z'),
      deletedAt: null
    },
    createdEntitlement: {
      id: expect.anything(),
      name: 'Therapy',
      servicePeriodDays: 30,
      quantityPerPeriod: 1,
      resourceIds: [1],
      regionIds: [1],
      insuranceEnabledFor: [],
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      deletedAt: null
    },
    updatedEntitlement: {
      id: 1,
      name: 'Coaching',
      servicePeriodDays: 30,
      quantityPerPeriod: 1,
      resourceIds: [1],
      regionIds: [1],
      insuranceEnabledFor: [],
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: expect.anything(),
      deletedAt: null
    }
  }

  public requestDtos: EntitlementDtos = {
    createEntitlementDto: {
      name: 'Therapy',
      servicePeriodDays: 30,
      quantityPerPeriod: 1,
      resourceIds: [1],
      regionIds: [1],
      insuranceEnabledFor: [],
    },
    updateEntitlementDto: {
      name: 'Coaching',
      servicePeriodDays: 30,
      quantityPerPeriod: 1,
      resourceIds: [1],
      regionIds: [1],
      insuranceEnabledFor: [],
    }
  }

  public errors: { [key: string]: Error } = {
    notFound: new NotFoundException('entitlement not found'),
    serverError: new InternalServerErrorException('entitlement could not be updated')
  }
}
