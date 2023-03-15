import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ClassConstructor } from 'class-transformer'
import { IExtendedRepository } from 'src/database/extend-repo'


// https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class
export function getAllFunctions(toCheck) {
    const props = []
    let obj = toCheck
    do {
        props.push(...Object.getOwnPropertyNames(obj))
    } while (obj = Object.getPrototypeOf(obj))

    return props.sort().filter((e, i, arr) => { 
      try {
        if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true
      } catch {
        // Found an edge case with 'target' that would throw an exception, not likely to need anything that throws
        return false
      }
    })
}

export function mockClass<T>(toMock: ClassConstructor<T>): T {
    const result = {}
    const ignoredFunction = [
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

    let _toMock: T
    try {
      _toMock = new toMock()
    } catch {
      _toMock = toMock.prototype
    }

    const functions = getAllFunctions(_toMock).filter(item => ignoredFunction.indexOf(item) === -1)
    functions.forEach(property => {
      result[property] = jest.fn()
    })
    return result as T
}

export function mockProviders(providers: ClassConstructor<any>[]) {
    const result = []
    providers.forEach(provider => {
        result.push({
            provide: provider,
            useValue: mockClass<typeof provider>(provider)
        })
    })
    return result
}

export function mockRepositories(entities: ClassConstructor<any>[]) {
    const result = []
    entities.forEach(entity => {
      const mockedRepository = {
        ...mockClass(Repository),
        isExtended: true,
        updateById: jest.fn(),
        findRelatedAndCountBy: jest.fn(),
        findAndCountWithRelated: jest.fn()
      }
      result.push({
          provide: getRepositoryToken(entity),
          useValue: mockedRepository
      })
    })
    return result
}
