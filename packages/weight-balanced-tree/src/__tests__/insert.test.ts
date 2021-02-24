import { deepCopy } from '@structured/binary-tree'
import { Comparator, insert, isBalanced, WBTNode } from '..'
import '../../setupTests'

describe('insert', () => {
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
      left: { key: 1, value: 1, weight: 1 },
      key: 2,
      value: 2,
      right: { key: 3, value: 3, weight: 1 },
      weight: 3,
    },
    key: 4,
    value: 4,
    right: {
      left: { key: 5, value: 5, weight: 1 },
      key: 6,
      value: 6,
      right: { key: 7, value: 7, weight: 1 },
      weight: 3,
    },
    weight: 7,
  }
  const compare: Comparator<number> = (a, b) => a - b

  expect(root).toHaveCorrectWeights()
  expect(root).toBeBalanced(isBalanced)

  const newKey = 0
  const newValue = 0
  const rootCopy = deepCopy(root)
  const oneInsertion = insert<number, number>(root, newKey, newValue, compare)
  const manyInsertions = [...Array(100)]
    .map((_, i) => i)
    .reduce<WBTNode<number, number> | undefined>(
      (root, i) => insert(root, i, i, compare),
      undefined
    )
  const shouldThrow = () => insert(root, root.key, root.value, compare)

  it('Should insert a new key, value pair', () => {
    expect(oneInsertion).toHaveCorrectWeights()
    expect(oneInsertion.weight).toBe(root.weight + 1)
  })

  it('Should not modify the original tree', () => {
    expect(oneInsertion).not.toBe(root)
    expect(root).toMatchObject(rootCopy)
  })

  it('Should only duplicate the nodes that have changed', () => {
    // This is specific to the test case. We know that the inserted value will
    // be at the far left, so the right subtree of the root should be unchanged.
    expect(oneInsertion.right).toBe(root.right)
  })

  it('Should keep the tree balanced', () => {
    expect(oneInsertion).toBeBalanced(isBalanced)
    expect(manyInsertions).toBeBalanced(isBalanced)
  })

  it('Should keep the weights correct', () => {
    expect(oneInsertion).toHaveCorrectWeights()
    expect(manyInsertions).toHaveCorrectWeights()
  })

  it('Should throw if the key is already in the tree', () => {
    expect(shouldThrow).toThrowError(/^Attempted duplicate keys insertion: /)
  })
})
