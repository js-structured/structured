import {
  BTNode,
  rotateWith,
  SingleLeft,
  DoubleLeft,
  SingleRight,
  DoubleRight,
  RotateCallback,
} from '@structured/binary-tree'
import {
  map,
} from '@structured/iterable'

// Set defaults for tree rotation so that weights are kept accurate
const { singleLeft, singleRight, doubleLeft, doubleRight } = rotateWith<{
  weight: number
}>(
  (a, b) => [
    { ...a, weight: a.weight - ((b.right?.weight ?? 0) + 1) },
    { ...b, weight: b.weight + ((a.left?.weight ?? 0) + 1) },
  ],
  (b, c) => [
    { ...b, weight: b.weight + ((c.right?.weight ?? 0) + 1) },
    { ...b, weight: c.weight - ((b.left?.weight ?? 0) + 1) },
  ]
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
 * @param node The root of a weight balanced tree
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
 * @param node The root of a weight balanced tree
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
export type WBTNode<K, V> = BTNode<
  Readonly<{ weight: number; key: K; value: V }>
>

/**
 * Inserts a new key into the tree. If the key is already in the tree, throws an
 * error.
 *
 * @param root The root of the tree to insert into
 * @param key The key to insert
 * @param value The value to insert at key
 * @param compare A comparator for keys so that the keys can remain sorted
 */
export function insert<K, V>(
  root: WBTNode<K, V> | undefined,
  key: K,
  value: V,
  compare: Comparator<K>
): WBTNode<K, V> {
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

/**
 * Removes a key-value pair from the tree with a given key. If the key is not in
 * the tree, returns the original tree as is.
 *
 * @param root The root of the tree
 * @param key The key to remove from the tree
 * @param compare The compare function that the tree is sorted by
 */
export function remove<K, V>(
  root: WBTNode<K, V> | undefined,
  key: K,
  compare: Comparator<K>
): WBTNode<K, V> | undefined {
  if (!root) {
    return root
  }

  const d = compare(key, root.key)

  if (d < 0) {
    const left = remove(root.left, key, compare)
    return left === root.left
      ? root
      : balanceLeft({ ...root, left, weight: root.weight - 1 })
  } else if (d > 0) {
    const right = remove(root.right, key, compare)
    return right === root.right
      ? root
      : balanceRight({ ...root, right, weight: root.weight - 1 })
  }

  // The current root is the node we want to remove.
  if (root.left && root.right) {
    // Two children.
    // We will replace the current root with its predecessor, and remove the
    // predecessor from the left subtree.
    let pre = root.left
    while (pre.right) {
      pre = pre.right
    }

    return balanceLeft({
      ...pre,
      left: remove(root.left, pre.key, compare),
      right: root.right,
      weight: root.weight - 1,
    })
  }

  // If at most one of the children is defined, they must be a single node.
  // Since we assume that the tree is balanced.
  return root.left || root.right
}

/**
 * Finds a node in the tree depending on a `whereToNext` function.
 *
 * When called on a node, the return value of the `whereToNext` function should
 * inform `findNode` where to recurse down.
 *
 * - If it is negative, we recurse to the left subtree.
 * - If it is positive, we recurse to the right subtree.
 * - If is is zero, we return the current node.
 *
 * @param root The root of the tree
 * @param whereToNext A function that informs findNode of which subtree to
 * recurse down.
 */
export function findNode<K, V>(
  root: WBTNode<K, V> | undefined,
  whereToNext: (from: WBTNode<K, V>) => number
): WBTNode<K, V> | undefined {
  while (root) {
    const d = whereToNext(root)

    if (d < 0) {
      root = root.left
    } else if (d > 0) {
      root = root.right
    } else {
      break
    }
  }

  return root
}

/**
 * Returns a function that can be passed to findNode, so that the node at the
 * target index may be found.
 *
 * @param idx The target 0-based index
 */
export const whereIsIndex = <K, V>(idx: number) => (node: WBTNode<K, V>) => {
  const left = node.left?.weight ?? 0

  if (idx > left) {
    idx -= left + 1
    return 1
  } else if (idx < left) {
    return -1
  } else {
    return 0
  }
}

/**
 * Finds the `idx`th node in the tree.
 *
 * @param root The root of the tree
 * @param idx The target index
 */
export function findByIndex<K, V>(
  root: WBTNode<K, V> | undefined,
  idx: number
): WBTNode<K, V> | undefined {
  return findNode(root, whereIsIndex(idx))
}

/**
 * Returns a function that can be passed to findNode, so that the node with the
 * target key may be found.
 *
 * @param key The target key
 * @param compare The comparison function that the tree satisfies
 */
export const whereIsKey = <K, V>(key: K, compare: Comparator<K>) => (
  node: WBTNode<K, V>
) => compare(key, node.key)

/**
 * Finds the node with the target key in the tree.
 *
 * @param root The root of the tree
 * @param key The target key
 * @param compare The comparison function that the tree satisfies
 */
export function findByKey<K, V>(
  root: WBTNode<K, V> | undefined,
  key: K,
  compare: Comparator<K>
): WBTNode<K, V> | undefined {
  return findNode(root, whereIsKey(key, compare))
}

/**
 * Produces a weight-balanced-tree from a sorted array.
 *
 * @param sorted An array of key-value pairs sorted by key
 */
export function fromSorted<K, V>(sorted: [K, V][]): WBTNode<K, V> | undefined {
  const getNodeFromRange = (
    lo: number,
    hi: number
  ): WBTNode<K, V> | undefined => {
    if (lo > hi) {
      return undefined
    }
    const mid = lo + ((hi - lo) >> 1)
    const [key, value] = sorted[mid]
    return {
      key,
      value,
      weight: hi - lo + 1,
      left: getNodeFromRange(lo, mid - 1),
      right: getNodeFromRange(mid + 1, hi),
    }
  }

  return getNodeFromRange(0, sorted.length - 1)
}

/**
 * Iterates the key-value pairs of the weight balanced tree in key order.
 *
 * @param root The root of the weight-balanced tree
 */
export function* iterateTree<K, V>(
  root: WBTNode<K, V> | undefined
): Generator<[K, V], void> {
  const stack = []
  let curr = root

  while (curr || stack.length) {
    while (curr) {
      stack.push(curr)
      curr = curr.left
    }
    // We know that if the stack had no elements before, then curr was defined,
    // and thus must have been added to the stack.
    // @ts-ignore
    curr = stack.pop()!
    yield [curr.key, curr.value]
    curr = curr.right
  }
}

/**
 * Iterates over they keys of the tree in key-order.
 *
 * @see [[iterateTree]]
 * @param root The root of the tree
 */
export function* iterateTreeKeys<K, V>(
  root: WBTNode<K, V> | undefined
): Generator<K, void> {
  yield* map(([k]) => k, iterateTree(root))
}

/**
 * Iterates over the values of the tree in key-order.
 *
 * @see [[iterateTree]]
 * @param root The root of the tree
 */
export function* iterateTreeValues<K, V>(
  root: WBTNode<K, V> | undefined
): Generator<V, void> {
  yield* map(([_k, v]) => v, iterateTree(root))
}
