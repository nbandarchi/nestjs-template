import { getRepositoryToken } from '@nestjs/typeorm'
import { getAllFunctions, mockClass, mockProviders, mockRepositories } from './mock-providers'

class TestClass {
  public classFunction(param1) { return param1 }
  public anonymousFunction = (param2) => { return param2 }
}

const functionKeys = ['classFunction', 'anonymousFunction']
const crudFunctions = ['find', 'create', 'update', 'delete']

const builtInFunctions = [
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
]

describe('getAllFunctions()', () => {
  it('should return a list of function names for a given object', () => {
    expect(getAllFunctions(new TestClass())).toEqual(expect.arrayContaining(functionKeys))
  })

  it('should not include primitive types in the result', () => {
    const primitive = {
      string: 'string', 
      number: 0,
      boolean: true,
      undefined: undefined,
      null: null,
    }
    expect(getAllFunctions(primitive)).toEqual(builtInFunctions)
  })
})

describe('mockClass()', () => {
  it('should return an object with all functions replaced with jest.fn()', () => {
    const actual = new TestClass()
    const mocked = mockClass<TestClass>(TestClass)
    for(let key of functionKeys) {
      expect(actual[key]('test')).not.toEqual(mocked[key]('test'))
      expect(mocked[key].mockImplementation).toBeDefined()
    }
    expect.assertions(2 * functionKeys.length)
  })

  // Not an intentional behavior, here to illustrate a limitation of the function
  // If a blank constructor throws an expception it falls back to `.prototype` which does not include anonymous functions
  it('should not include anonymous class functions if the constructor throws an exception', () => {
    class TestClassWithConstuctor extends TestClass {
      constructor(val: any) {
        super()
        this.val = val.toString()
      }
      public val: string
    }
    const mocked = mockClass<TestClassWithConstuctor>(TestClassWithConstuctor)
    expect(mocked.classFunction).toBeDefined()
    expect(mocked.anonymousFunction).toBeUndefined()
  })

  it.each(builtInFunctions)('should not replace built in %s function', (key: string) => {
    const mocked = mockClass<TestClass>(TestClass)
    expect(mocked[key].mockImplementation).toBeUndefined()
  })
})

describe('mockProviders()', () => {
  it('should should return an array of mocked providers', () => {
    const providers = mockProviders([TestClass])
    expect(providers).toEqual([{
      provide: TestClass,
      useValue: expect.anything()
    }])
    for (let key of functionKeys) {
      expect(providers[0].useValue[key].mockImplementation).toBeDefined()
    }
    expect.assertions(1 + functionKeys.length)
  })
})

describe('mockRepositories()', () => {
  it('should should return an array with mocked TypeORM repositories', () => {
    const providers = mockRepositories([TestClass])
    expect(providers).toEqual([{
      provide: getRepositoryToken(TestClass),
      useValue: expect.anything()
    }])
    for (let key of crudFunctions) {
      expect(providers[0].useValue[key].mockImplementation).toBeDefined()
    }
  })
})
