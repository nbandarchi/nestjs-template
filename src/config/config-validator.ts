export function assertEnv(key: string, defaultValue?: string): string {
  const result = process.env[key]
  if (result === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`missing environment variable: ${key}`)
  }
  return result
}

export function assertBoolean(value: string): boolean {
  if (value && value.toLowerCase() === 'true') {
    return true
  } else if (value && value.toLowerCase() === 'false') {
    return false
  } else {
    throw new Error('value is not a boolean')
  }
}

export function assertNumber(value: string): number {
  const result = value.length > 0 ? Number(value) : NaN
  if (isNaN(result)) {
    throw new Error('value is not a number')
  }
  return result
}

export function assertEnum<T>(value: string, type: any): T {
  const result = Object.entries(type).find(item => item[1] === value)
  if (!result) {
    throw new Error(`could not convert '${value}' to enum`)
  }
  return result[1] as T
}
