import { BaseFixture, DataItem } from './base.fixture'
import { ProductDto, CreateProductDto, UpdateProductDto, GetProductDto } from '../../products/dtos'
import { Product } from '../../products/product.entity'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'

type ProductDtos = {
  createProductDto: CreateProductDto,
  updateProductDto: UpdateProductDto,
  getProductDto: GetProductDto
}

export class ProductsFixture extends BaseFixture<Product, ProductDto>  {
  constructor() {
    super(Product)
    this.initialize()
  }

  public entityKeysToSeed: string[] = ['testProduct', 'productWithRegion']
  public data: { [key: string]: DataItem<Product, ProductDto>} = {
    testProduct: {
      id: 1,
      name: 'McNuggets',
      public: true,
      externalOfferings: [],
      entitlementIds: [1],
      regionIds: [],
      excludedProducts: [],
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: new Date('2022-06-08T18:22:24.124Z'),
      deletedAt: null
    },
    productWithRegion: {
      id: 2,
      name: 'Chicken Sandwhich',
      public: true,
      externalOfferings: [4],
      entitlementIds: [1],
      regionIds: [7],
      excludedProducts: [1],
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: expect.anything(),
      deletedAt: null
    },
    createdProduct: {
      id: expect.anything(),
      name: 'Whopper',
      public: true,
      externalOfferings: [1],
      entitlementIds: [1],
      regionIds: [3],
      excludedProducts: [],
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      deletedAt: null
    },
    updatedProduct: {
      id: 1,
      name: 'Baconator',
      public: true,
      externalOfferings: [4],
      entitlementIds: [],
      regionIds: [7],
      excludedProducts: [1],
      createdAt: new Date('2022-06-08T18:22:24.124Z'),
      updatedAt: expect.anything(),
      deletedAt: null
    }
  }

  public requestDtos: ProductDtos = {
    createProductDto: {
      name: 'Whopper',
      public: true,
      externalOfferings: [1],
      entitlementIds: [1],
      regionIds: [3],
      excludedProducts: [],
    },
    updateProductDto: {
      name: 'Baconator',
      public: true,
      externalOfferings: [4],
      entitlementIds: [],
      regionIds: [7],
      excludedProducts: [1],
    },
    getProductDto: new GetProductDto({
      id: 1,
      region: 7,
      withEntitlements: false,
    })
  }

  public errors: { [key: string]: Error } = {
    notFound: new NotFoundException('product not found'),
    serverError: new InternalServerErrorException('product could not be updated')
  }
}
