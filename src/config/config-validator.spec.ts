import { assertBoolean, assertEnum, assertEnv, assertNumber } from './config-validator'

describe('config-validator', () => {
  describe('assertEnv()', () => {
    it('should return an environment variable by key', () => {
      process.env.TEST_KEY = 'huzzah!'
      expect(assertEnv('TEST_KEY')).toEqual('huzzah!')
      delete process.env.TEST_KEY
    })

    it('should return an optional default value if key does not exist', () => {
      expect(process.env.DEFAULT_KEY).toBeUndefined()
      expect(assertEnv('DEFAULT_KEY', 'defaultValue')).toEqual('defaultValue')
    })

    it('should throw an Error if key does not exist', () => {
      expect(() => assertEnv('MISSING_KEY')).toThrow(new Error('missing environment variable: MISSING_KEY'))
    })
  })

  describe('assertBoolean()', () => {
    it.each(['true', 'True', 'TRUE'])('should return true from %s', (value: string) => {
      expect(assertBoolean(value)).toStrictEqual(true)
    })

    it.each(['false', 'False', 'FaLsE'])('should return false from %s', (value: string) => {
      expect(assertBoolean(value)).toStrictEqual(false)
    })

    it.each([undefined, '1', 'no'])('should throw an Error if value is not a boolean string (%s)', (value: string) => {
      expect(() => assertBoolean(value)).toThrow('value is not a boolean')
    })
  })

  describe('assertNumber()', () => {
    it('should return a string as a number', () => {
      expect(assertNumber('100')).toEqual(100)
    })

    it.each(['one hundred', ''])('should throw an Error if value is NaN ($s)', (value: string) => {
      expect(() => assertNumber(value)).toThrow('value is not a number')
    })
  })

  describe('assertEnum()', () => {
    enum Test {
      Valid = 'valid'
    }

    it('should return the input string if contained in enum', () => {
      expect(assertEnum<Test>(Test.Valid, Test)).toEqual('valid')
    })

    it('should throw an Error if value is not contained in enum', () => {
      expect(() => assertEnum<Test>('invalid', Test)).toThrow(`could not convert 'invalid' to enum`)
    })

    it('should throw an Error if attempting to pass the key instead of value', () => {
      expect(() => assertEnum<Test>('Valid', Test)).toThrow(`could not convert 'Valid' to enum`)
    })
  })
})
