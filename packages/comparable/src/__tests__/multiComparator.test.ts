import {
  Comparator,
  getIterableComparator,
  getTupleComparator,
  numberIncreasing,
  stringIncreasing,
} from '..'

describe('iterable comparator', () => {
  const multiNumComp = getIterableComparator(numberIncreasing)

  it('Should compare iterables lexicographically', () => {
    const a = [1, 2, 3, 4, 1, 6]
    const b = [1, 2, 3, 4, 5, 6, 7]

    expect(multiNumComp(a, b)).toBeLessThan(0)
    expect(multiNumComp(b, a)).toBeGreaterThan(0)
    expect(multiNumComp(a, a)).toBe(0)
    expect(multiNumComp(a, a.concat([-Infinity]))).toBeLessThan(0)
  })
})

describe('tuple comparator', () => {
  const strNumComp = getTupleComparator(stringIncreasing, numberIncreasing)

  it('Should compare tuples lexicographically', () => {
    const a: [string, number] = ['hello', 5]
    const b: [string, number] = ['hello', 6]

    expect(strNumComp(a, b)).toBeLessThan(0)
    expect(strNumComp(b, a)).toBeGreaterThan(0)
    expect(strNumComp(a, a)).toBe(0)
  })
})
