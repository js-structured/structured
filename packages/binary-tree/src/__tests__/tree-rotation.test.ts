import {
  BTNode,
  doubleLeft,
  doubleRight,
  singleLeft,
  singleRight,
  deepCopy,
} from '..'

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
  describe.each<[string, BTNode, (root: BTNode) => BTNode]>([
    ['single left', rightHeavy, singleLeft],
    ['single right', leftHeavy, singleRight],
    ['double left', rightMiddleHeavy, doubleLeft],
    ['double right', leftMiddleHeavy, doubleRight],
  ])('%s', (_name, root, remedy) => {
    // Since we want to test whether the root is a copy or not, we use the
    // deprecated copy method.
    const orig = deepCopy(root)
    const result = remedy(root)

    it('Should rotate as expected', () => {
      expect(result).toMatchObject(balanced)
    })

    it('Should not alter the original tree', () => {
      expect(root).toMatchObject(orig)
    })
  })
})
