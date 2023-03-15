import { BaseFixture, DataItem } from '../base.fixture'
import { User, UserDto, CreateUserDto, UpdateUserDto } from './user-example'
import snakeCaseKeys from 'snakecase-keys'
import { NotFoundException } from '@nestjs/common'

type UserDtos = {
  createUserDto: CreateUserDto,
  updateUserDto: UpdateUserDto
}

export class UserFixture extends BaseFixture<User, UserDto>  {
  constructor() {
    super(User)
    this.initialize()
  }

  // These keys from `data` will be used to setup and teardown the test DB
  public entityKeysToSeed: string[] = ['testUser']

  // Note: types should be included when defining these constants
  // If not, typescript will still enforce the minimum required fields but will also allow extra properties
  public data: { [key: string]: DataItem<User, UserDto>} = {
    testUser: {
      id: 1,
      email: 'test.user@gmail.com',
      password: 'testing123'          
    },
    // expect.anything() can be substitued for dynamic data such as generated IDs and Datetimes
    createdUser: {
      id: expect.anything(),
      email: 'new.user@gmail.com',
      password: 'totallySecur3',
    },
    updatedUser: {
      id: 1, 
      email: 'updated.user@gmail.com',
      password: 'newP@ssword!'
    }
  }

  public requestDtos: UserDtos = {
    createUserDto: {
        email: 'new.user@gmail.com',
        password: 'totallySecur3',
    },
    updateUserDto: {
        email: 'updated.user@gmail.com',
        password: 'newP@ssword!'
    }
  }

  public errors: { [key: string]: Error } = {
    notFound: new NotFoundException('user not found')
  }
}
