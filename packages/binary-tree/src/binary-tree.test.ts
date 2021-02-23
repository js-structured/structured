import { BTNode, doubleLeft, doubleRight, singleLeft, singleRight } from '.'

/**
 * Returns a deep copy of a weight balanced tree.
 */
export function deepCopy<N extends BTNode | undefined>(root: N): N {
  return (
    root && {
      ...root,
      left: deepCopy(root.left),
      right: deepCopy(root.right),
    }
  )
}

export const rightHeavy = Object.freeze({
  data: 'a',
  right: {
    data: 'b',
    right: {
      data: 'c',
    },
  },
} as const)
export const leftHeavy = Object.freeze({
  data: 'c',
  left: {
    data: 'b',
    left: {
      data: 'a',
    },
  },
} as const)
export const rightMiddleHeavy = Object.freeze({
  data: 'a',
  right: {
    data: 'c',
    left: {
      data: 'b',
    },
  },
} as const)
export const leftMiddleHeavy = Object.freeze({
  data: 'c',
  left: {
    data: 'a',
    right: {
      data: 'b',
    },
  },
} as const)
export const balanced = Object.freeze({
  data: 'b',
  left: { data: 'a' },
  right: { data: 'c' },
} as const)

describe('tree rotation', () => {
  describe.each([
    ['single left', deepCopy(rightHeavy), singleLeft],
    ['single right', deepCopy(leftHeavy), singleRight],
    ['double left', deepCopy(rightMiddleHeavy), doubleLeft],
    ['double right', deepCopy(leftMiddleHeavy), doubleRight],
  ])('%s', (_name, root, remedy) => {
    const result = remedy(root)

    it('Should rotate right', () => {
      expect(result).toMatchObject(balanced)
    })
  })
})
