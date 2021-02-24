import {
  BTNode,
  rotateWith,
  SingleLeft,
  DoubleLeft,
  SingleRight,
  DoubleRight,
  RotateCallback,
} from '@structured/binary-tree'

export type WBTNode<K extends number | string, V> = BTNode<{
  weight: number
  key: K
  value: V
}>

// Set defaults for tree rotation so that weights are kept accurate
const { singleLeft, singleRight, doubleLeft, doubleRight } = rotateWith<{
  weight: number
}>(
  (a, b) => {
    a.weight -= (b.right?.weight ?? 0) + 1
    b.weight += (a.left?.weight ?? 0) + 1
  },
  (b, c) => {
    b.weight += (c.right?.weight ?? 0) + 1
    c.weight -= (b.left?.weight ?? 0) + 1
  }
)

/**
 * Determines whether a single rotation will be sufficient to balance the left
 * and right trees.
 */
export function isSingle(
  mightBeLarge: BTNode<{ weight: number }> | undefined,
  mightBeSmall: BTNode<{ weight: number }> | undefined
): boolean {
  const lSize = (mightBeLarge?.weight ?? 0) + 1
  const sSize = (mightBeSmall?.weight ?? 0) + 1

  // Equivalent to lSize < sqrt(2) * sSize, since both lSize and sSize are
  // positive.

  // We can assert the type, because if L is undefined, then the lhs will be 1,
  // and the least the rhs could be is 2.
  return lSize * lSize < 2 * sSize * sSize
}

/**
 * Determines whether two trees are balanced.
 */
export function isBalanced(
  mightBeLarge: BTNode<{ weight: number }> | undefined,
  mightBeSmall: BTNode<{ weight: number }> | undefined
): boolean {
  const lSize = (mightBeLarge?.weight ?? 0) + 1
  const sSize = (mightBeSmall?.weight ?? 0) + 1
  const totalSize = lSize + sSize

  // Equivalent to sqrt(2) * sSize < totalSize, since all values are positive.
  return 2 * sSize * sSize < totalSize * totalSize
}

/**
 * Balances a potentially right heavy weight balanced tree.
 *
 * @param node The root of a weight balanced tree.
 * @returns The new root of the balanced tree
 */
export function balanceLeft<
  T extends { weight: number },
  N extends BTNode<T> | undefined
>(
  node: N,
  onLeft: RotateCallback<T> | RotateCallback<T>[] = [],
  onRight: RotateCallback<T> | RotateCallback<T>[] = []
): N | SingleLeft<T, N> | DoubleLeft<T, N> {
  if (!node?.right || isBalanced(node.left, node.right)) {
    return node
  }

  return isSingle(node.right.left, node.right.right)
    ? singleLeft<T, N>(node, onLeft)
    : doubleLeft<T, N>(node, onRight)
}

/**
 * Balances a potentially left heavy weight balanced tree.
 *
 * @param node The root of a weight balanced tree.
 * @returns The new root of the balanced tree
 */
export function balanceRight<
  T extends { weight: number },
  N extends BTNode<T> | undefined
>(
  node: N,
  onLeft: RotateCallback<T> | RotateCallback<T>[] = [],
  onRight: RotateCallback<T> | RotateCallback<T>[] = []
): N | SingleRight<T, N> | DoubleRight<T, N> {
  if (!node?.left || isBalanced(node.right, node.left)) {
    return node
  }

  return isSingle(node.left.right, node.left.left)
    ? singleRight<T, N>(node, onLeft)
    : doubleRight<T, N>(node, onRight)
}
