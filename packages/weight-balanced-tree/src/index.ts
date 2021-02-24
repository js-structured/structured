import {
  BTNode,
  rotateWith,
  SingleLeft,
  DoubleLeft,
  SingleRight,
  DoubleRight,
  RotateCallback,
} from '@structured/binary-tree'

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

export type Comparator<K> = (a: K, b: K) => number
export type WBTNode<K, V> = BTNode<{ weight: number; key: K; value: V }>

/**
 * Inserts a new key into the tree. If the key is already in the tree, throws an
 * error.
 *
 * @param root The root of the tree to insert into
 * @param key The key to insert
 * @param value The value to insert at key
 * @param compare A comparator for keys so that the keys can remain sorted.
 */
export function insert<
  K,
  V,
  N extends WBTNode<K, V> | undefined = WBTNode<K, V> | undefined
>(root: N, key: K, value: V, compare: Comparator<K>): WBTNode<K, V> {
  if (!root) {
    return { key, value, weight: 1 }
  }

  const d = compare(key, root.key)

  if (d < 0) {
    return balanceRight({
      ...root,
      left: insert(root.left, key, value, compare),
      weight: root.weight + 1,
    })
  } else if (d > 0) {
    return balanceLeft({
      ...root,
      right: insert(root.right, key, value, compare),
      weight: root.weight + 1,
    })
  } else {
    throw new Error(`Attempted duplicate keys insertion: ${key} ${root.key}`)
  }
}
