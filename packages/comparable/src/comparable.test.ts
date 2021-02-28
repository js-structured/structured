import {
  Comparator,
  numberIncreasing,
  stringIncreasing,
  reverseCompare,
} from '.'

describe.each<[string, any[], Comparator<any>]>([
  ['number', [1, 5, 7, 4, 2, 5, 8, 9, 100, 29, -5, Infinity], numberIncreasing],
  ['string', ['He', 'Woah', 'Help', '', 'brown'], stringIncreasing],
])('%s increasing', (name, values, compare) => {
  const sorted = [...values].sort(compare)

  it(`Should sort an array of ${name}s so that they are increasing`, () => {
    let prev = sorted[0]
    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i]
      expect(prev <= curr).toBe(true)
      expect(compare(prev, curr)).toBeLessThanOrEqual(0)
      prev = curr
    }
  })
})

describe('reverse compare', () => {
  const values = [1, 5, 7, 4, 2, 5, 8, 9, 100, 29, -5, Infinity]
  const sorted = [...values].sort(numberIncreasing)
  const reverseSorted = [...values].sort(reverseCompare(numberIncreasing))

  it('Should sort an array in reverse', () => {
    const sortedReversed = [...sorted].reverse()

    expect(sortedReversed).toMatchObject(reverseSorted)
  })
})
