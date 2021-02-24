import { BTNode, deepCopy } from '@structured/binary-tree'
import { balanceLeft, balanceRight, isBalanced } from '..'
import '../../setupTests'

export const rightHeavy = Object.freeze({
  data: 'a',
  weight: 3,
  right: {
    data: 'b',
    weight: 2,
    right: {
      weight: 1,
      data: 'c',
    },
  },
} as const)
export const leftHeavy = Object.freeze({
  data: 'c',
  weight: 3,
  left: {
    data: 'b',
    weight: 2,
    left: {
      data: 'a',
      weight: 1,
    },
  },
} as const)
export const rightMiddleHeavy = Object.freeze({
  data: 'a',
  weight: 3,
  right: {
    data: 'c',
    weight: 2,
    left: {
      data: 'b',
      weight: 1,
    },
  },
} as const)
export const leftMiddleHeavy = Object.freeze({
  data: 'c',
  weight: 3,
  left: {
    data: 'a',
    weight: 2,
    right: {
      data: 'b',
      weight: 1,
    },
  },
} as const)
export const balanced = Object.freeze({
  data: 'b',
  weight: 3,
  left: { data: 'a', weight: 1 },
  right: { data: 'c', weight: 1 },
} as const)

describe('balance', () => {
  describe.each<
    [
      string,
      typeof balanceLeft | typeof balanceRight,
      [string, BTNode<{ weight: number }>][],
      [string, BTNode<{ weight: number }>][]
    ]
  >([
    [
      'balance left',
      balanceLeft,
      [
        ['right-heavy', rightHeavy],
        ['right-middle-heavy', rightMiddleHeavy],
      ],
      [['already balanced', balanced]],
    ],
    [
      'balance right',
      balanceRight,
      [
        ['left-heavy', leftHeavy],
        ['left-middle-heavy', leftMiddleHeavy],
      ],
      [['already balanced', balanced]],
    ],
  ])('%s', (_name, remedy, problem, nonProblem) => {
    describe.each(problem)('%s', (_name, root) => {
      const orig = deepCopy(root)
      const result = remedy(root)

      it('Should balance the tree', () => {
        expect(result).toBeBalanced(isBalanced)
      })

      it('Should keep node sizes correct', () => {
        expect(result).toHaveCorrectWeights()
      })
    })

    describe.each(nonProblem)('%s', (_name, root) => {
      const result = remedy(root)

      it('Should leave the tree as is', () => {
        expect(result).toBe(root)
      })
    })
  })
})
