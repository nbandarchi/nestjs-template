import { BaseFixture, DataItem } from './base.fixture'
import { ResourceDto, CreateResourceDto, UpdateResourceDto } from '../../resources/dtos'
import { Resource } from '../../resources/resource.entity'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'

type ResourceDtos = {
  createResourceDto: CreateResourceDto,
  updateResourceDto: UpdateResourceDto
}

export class ResourcesFixture extends BaseFixture<Resource, ResourceDto> {
  constructor() {
    super(Resource)
    this.initialize()
  }

  public entityKeysToSeed: string[] = ['testResource', 'testResource2']
  public data: { [key: string]: DataItem<Resource, ResourceDto> } = {
    testResource: {
      id: 1,
      name: 'Therapist',
      billable: true,
      acceptsInsurance: true,
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: new Date('2022-06-08T18:22:24.124Z'),
      deletedAt: null
    },
    testResource2: {
      id: 2,
      name: 'Sensei',
      billable: true,
      acceptsInsurance: true,
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: new Date('2022-06-08T18:22:24.124Z'),
      deletedAt: null
    },
    createdResource: {
      id: expect.anything(),
      name: 'Therapist',
      billable: true,
      acceptsInsurance: true,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      deletedAt: null
    },
    updatedResource: {
      id: 1,
      name: 'Coach',
      billable: false,
      acceptsInsurance: false,
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: expect.anything(),
      deletedAt: null
    }
  }

  public requestDtos: ResourceDtos = {
    createResourceDto: {
      name: 'Therapist',
      billable: true,
      acceptsInsurance: true
    },
    updateResourceDto: {
      name: 'Coach',
      billable: false,
      acceptsInsurance: false
    }
  }

  public errors: { [key: string]: Error } = {
    notFound: new NotFoundException('resource not found'),
    serverError: new InternalServerErrorException('resource could not be updated')
  }
}