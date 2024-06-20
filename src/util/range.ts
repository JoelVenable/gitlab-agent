export type CheckRangeArgs = {
  min: number
  max: number
  value: number
  name: string
}

export function checkRange(val: CheckRangeArgs) {
  if (!Number.isInteger(val.value)) {
    throw new Error(`${val.name} must be an integer`)
  }
  if (val.value < val.min || val.value > val.max) {
    throw new OutOfRangeException(val)
  }
  return val.value
}

export class OutOfRangeException extends Error {
  constructor({ min, max, value, name }: CheckRangeArgs) {
    super(`${name} must be between ${min} and ${max}. Received: ${value}`)
  }
}
