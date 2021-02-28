import { BTNode } from '@structured/binary-tree'
import { Comparator } from '@structured/comparable'
import { WBTNode } from './src'

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
       *
       * @param isBalanced A function to determine whether two child trees are
       * balanced
       */
      toBeBalanced(
        isBalanced: (
          a: BTNode<{ weight: number }>,
          b: BTNode<{ weight: number }>
        ) => boolean
      ): R

      /**
       * Makes sure that a binary search tree is ordered by the compare
       * function.
       *
       * @param compare The comparison function that the tree should be ordered
       * by
       */
      toBeOrdered<K>(compare: Comparator<K>): R
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
        `Expected node to be weighted ${pass ? 'in' : ''}correctly:

- Received: ${JSON.stringify(received, null, 2)}`,
      pass,
    }
  },
  toBeBalanced<T extends { weight: number }, N extends BTNode<T> | undefined>(
    received: N,
    isBalanced: (a: BTNode<T> | undefined, b: BTNode<T> | undefined) => boolean
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
      message: () => `Expected node to be ${pass ? 'un' : ''}balanced:

- Received: ${JSON.stringify(received, null, 2)}`,
      pass,
    }
  },
  toBeOrdered<K, V>(received: WBTNode<K, V>, compare: Comparator<K>) {
    const inorder = function* (
      node: WBTNode<K, V> | undefined
    ): Generator<WBTNode<K, V>> {
      if (!node) return
      yield* inorder(node.left)
      yield node
      yield* inorder(node.right)
    }

    const nodes = [...inorder(received)]
    const sorted = [...nodes].sort((a, b) => compare(a.key, b.key))
    const pass = sorted.every((v, i) => v === nodes[i])

    return {
      message: () => `Expected nodes to be ${pass ? 'un' : ''}ordered:

- Received: ${JSON.stringify(received, null, 2)}`,
      pass,
    }
  },
})
