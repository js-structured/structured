import { deepCopy } from '@structured/binary-tree'
import { isBalanced, remove, WBTNode, findByKey } from '..'
import { Comparator } from '@structured/comparable'
import '../../setupTests'

describe('remove', () => {
  /**
   * Represents the tree
   *
   * ```
   *       4
   *     /   \
   *   2       6
   *  / \     / \
   * 1   3   5   7
   * ```
   */
  const root: WBTNode<number, number> = {
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
  const rootCopy = deepCopy(root)
  const compare: Comparator<number> = (a, b) => a - b
  expect(root).toBeOrdered(compare)

  describe.each([
    ['middle removal', 3],
    ['left removal', 0],
    ['right removal', 6],
    ['no removal', 0.5],
  ])('%s', (_name, toRemove) => {
    const removed = remove(root, toRemove, compare)

    it('Should not alter the original tree', () => {
      expect(root).toMatchObject(rootCopy)
    })

    it('Should keep the tree balanced', () => {
      expect(removed).toBeBalanced(isBalanced)
    })

    it('Should keep the weights correct', () => {
      expect(removed).toHaveCorrectWeights()
    })

    it('Should keep the tree ordered', () => {
      expect(removed).toBeOrdered(compare)
    })

    it('Should remove the node from the tree', () => {
      expect(findByKey(removed, toRemove, compare)).toBeUndefined()
    })
  })
})
