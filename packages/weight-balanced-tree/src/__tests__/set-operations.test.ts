import { map } from '@structured/iterable'
import {
  union,
  intersection,
  fromSorted,
  isBalanced,
  iterateTree,
  findByKey,
} from '..'
import { Comparator } from '@structured/comparable'
import '../../setupTests'

describe('set operations', () => {
  const compare: Comparator<number> = (a, b) => a - b
  const aList = [0, 1, 2, 3, 4, 5, 6, 7]
  const bList = [5, 6, 7, 8, 9, 10, 11, 1000]
  const a = fromSorted(aList.sort(compare).map((v) => [v, {}]))
  const b = fromSorted(bList.sort(compare).map((v) => [v, {}]))

  const unionRoot = union(compare, a, b)
  const intersectionRoot = intersection(compare, a, b)

  for (const root of [a, b]) {
    expect(root).toBeBalanced(isBalanced)
    expect(root).toBeOrdered(compare)
    expect(root).toHaveCorrectWeights()
  }

  describe('union', () => {
    it('Should contain all keys', () => {
      const expected = new Set()

      for (const a of aList) {
        expected.add(a)
      }
      for (const b of bList) {
        expected.add(b)
      }

      expect(new Set(map(([k]) => k, iterateTree(unionRoot)))).toEqual(expected)
    })

    it('Should not contain duplicate keys', () => {
      const included = [...iterateTree(unionRoot)]

      expect(new Set(included.map(([k]) => k)).size).toBe(included.length)
    })

    it('Should have values matching the first tree', () => {
      for (const [key] of iterateTree(intersectionRoot)) {
        const node = findByKey(unionRoot, key, compare)
        expect(node).not.toBeUndefined()
        expect(node?.value).toBe(findByKey(a, key, compare)?.value)
      }
    })
  })

  describe('intersection', () => {
    it('Should contain the keys that appear in both trees', () => {
      const expected = new Set()

      for (const a of aList) {
        for (const b of bList) {
          if (a === b) {
            expected.add(a)
          }
        }
      }

      expect(new Set(map(([k]) => k, iterateTree(intersectionRoot)))).toEqual(
        expected
      )
    })

    it('Should not contain duplicate keys', () => {
      const included = [...iterateTree(intersectionRoot)]

      expect(new Set(included.map(([k]) => k)).size).toBe(included.length)
    })

    it('Should have values matching the first tree', () => {
      for (const [key, value] of iterateTree(intersectionRoot)) {
        expect(value).toBe(findByKey(a, key, compare)?.value)
      }
    })
  })
})
