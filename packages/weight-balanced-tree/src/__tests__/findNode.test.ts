import { findByIndex, findByKey } from '..'
import { Comparator } from '@structured/comparable'

describe('find node', () => {
  /**
   * Represents the tree
   *
   * ```
   *       3
   *     /   \
   *   1       5
   *  / \     / \
   * 0   2   4   6
   * ```
   */
  const root = {
    left: {
      left: { key: 0, value: 0, weight: 1 },
      key: 1,
      value: 1,
      right: { key: 2, value: 2, weight: 1 },
      weight: 3,
    },
    key: 3,
    value: 3,
    right: {
      left: { key: 4, value: 4, weight: 1 },
      key: 5,
      value: 5,
      right: { key: 6, value: 6, weight: 1 },
      weight: 3,
    },
    weight: 7,
  }

  describe('find by index', () => {
    it('Should find the correct node if it is in the tree', () => {
      expect(findByIndex(root, 3)).toBe(root)
      expect(findByIndex(root, 2)).toBe(root.left.right)
      expect(findByIndex(root, 6)).toBe(root.right.right)
    })

    it('Should return undefined if the index is invalid', () => {
      expect(findByIndex(root, -1)).toBeUndefined()
      expect(findByIndex(root, 1000)).toBeUndefined()
      expect(findByIndex(root, 0.5)).toBeUndefined()
    })
  })

  describe('find by key', () => {
    const cmp: Comparator<number> = (a, b) => a - b

    it('Should find the correct node if it is in the tree', () => {
      expect(findByKey(root, 3, cmp)).toBe(root)
      expect(findByKey(root, 2, cmp)).toBe(root.left.right)
      expect(findByKey(root, 6, cmp)).toBe(root.right.right)
    })

    it('Should return undefined if the value is not in the tree', () => {
      expect(findByKey(root, -1, cmp)).toBeUndefined()
      expect(findByKey(root, 1000, cmp)).toBeUndefined()
      expect(findByKey(root, 0.5, cmp)).toBeUndefined()
    })
  })
})
