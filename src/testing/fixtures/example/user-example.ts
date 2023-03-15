// These would not normally be all in one file, or so simple
// Took this out of a sample nest project I was working on and simplified/combined into one file for demo
export class User {
    id: number
    email: string
    password: string

    userMethod() {
        return `Hi, my email is ${this.email}`
    }
}

export class UserDto {
    id: number
    email: string
}

export class CreateUserDto {
    email: string
    password: string
  }

export class UpdateUserDto {
  email: string
  password: string
}