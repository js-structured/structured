import { BTNode } from '@structured/binary-tree'

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Makes sure that a weigh balanced tree has correct sizes for each node;
       * each nodes size is the number of nodes in the subtree rooted at that
       * node.
       */
      toHaveCorrectWeights(): R

      /**
       * Makes sure that a weight balanced tree is balanced by checking that
       * each node satisfies the balance criteria.
       */
      toBeBalanced(
        isBalanced: (
          a: BTNode<{ weight: number }>,
          b: BTNode<{ weight: number }>
        ) => boolean
      ): R
    }
  }
}

expect.extend({
  toHaveCorrectWeights<
    T extends { weight: number },
    N extends BTNode<T> | undefined
  >(received: N) {
    const checkNode = (node: BTNode<T> | undefined): [boolean, number] => {
      if (!node) return [true, 0]
      const [lGood, lWeight] = checkNode(node.left)
      const [rGood, rWeight] = checkNode(node.right)
      return [
        lGood && rGood && lWeight + rWeight + 1 === node.weight,
        node.weight,
      ]
    }

    const pass = checkNode(received)[0]

    return {
      message: () =>
        `Expected node to be weighted ${pass ? 'in' : ''}correctly`,
      pass,
    }
  },
  toBeBalanced<T extends { weight: number }, N extends BTNode<T> | undefined>(
    received: N,
    isBalanced: (a: BTNode<T>, b: BTNode<T>) => boolean
  ) {
    const checkNode = (node: BTNode<T> | undefined): boolean => {
      if (!node) return true
      if (
        !isBalanced(node.left, node.right) ||
        !isBalanced(node.right, node.left)
      ) {
        return false
      }
      return checkNode(node.left) && checkNode(node.right)
    }

    const pass = checkNode(received)

    return {
      message: () => `Expected node to be ${pass ? 'un' : ''}balanced`,
      pass,
    }
  },
})
