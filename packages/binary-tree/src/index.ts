/**
 * A generic binary tree node interface.
 *
 * Also instantiated with
 *
 * @template T The remaining type of the node.
 */
export type BTNode<T = unknown> = {
  readonly left?: BTNode<T> | undefined
  readonly right?: BTNode<T> | undefined
} & Omit<T, 'left' | 'right'>

/**
 * Updates the type of the left child of a node.
 *
 * @template N The original node.
 * @template L The new type for the left child.
 */
export type UpdateLeft<
  T,
  N extends BTNode<T>,
  L extends BTNode<T> | undefined
> = T & Omit<N, 'left'> & { left: L }

/**
 * Updates the type of the right child of a node.
 *
 * @template N The original node.
 * @template R The new type for the right child.
 */
export type UpdateRight<
  T,
  N extends BTNode<T>,
  R extends BTNode<T> | undefined
> = T & Omit<N, 'right'> & { right: R }

/**
 * The type of a node after being rotated left.
 */
export type SingleLeft<T, N extends BTNode<T> | undefined> = N extends BTNode<T>
  ? N['right'] extends infer R
    ? R extends BTNode<T>
      ? R['left'] extends infer L
        ? L extends BTNode<T> | undefined
          ? UpdateLeft<T, R, UpdateRight<T, N, L>>
          : UpdateLeft<T, R, UpdateRight<T, N, undefined>>
        : never
      : N
    : never
  : undefined

/**
 * The type of a node after being rotated right.
 */
export type SingleRight<
  T,
  N extends BTNode<T> | undefined
> = N extends BTNode<T>
  ? N['left'] extends infer L
    ? L extends BTNode<T>
      ? L['right'] extends infer R
        ? R extends BTNode<T> | undefined
          ? UpdateRight<T, L, UpdateLeft<T, N, R>>
          : UpdateRight<T, L, UpdateLeft<T, N, undefined>>
        : never
      : N
    : never
  : undefined

export type DoubleLeft<T, N extends BTNode<T> | undefined> = N extends BTNode<T>
  ? SingleLeft<T, UpdateRight<T, N, SingleRight<T, N['right']>>>
  : undefined

export type DoubleRight<
  T,
  N extends BTNode<T> | undefined
> = N extends BTNode<T>
  ? SingleRight<T, UpdateLeft<T, N, SingleLeft<T, N['left']>>>
  : undefined

/**
 * When given a root node for the tree matching `a` in
 *
 * ```
 * a
 *  \
 *   c
 *  /
 * b
 * ```
 *
 * Rotates the tree to
 *
 * ```
 *   c
 *  /
 * a
 *  \
 *   b
 * ```
 *
 * Then calls `onRotate` on `a` and `c` (in that order).
 *
 * Finally returns the new root, `c`. All other nodes are unchanged.
 *
 * If there is no right child on `a`, just returns `a` with no modification.
 *
 * In reality, the nodes whose left and right children seem to be changing are
 * being replaced by (shallow) copies of the nodes whose children will be
 * updated. This makes sure that unwanted side-effects can be avoided.
 *
 * @param a The node `a`
 * @param onRotate A callback that is called with the nodes `a` and `b`.
 * @returns The new root, `c`.
 */
export function singleLeft<T, N extends BTNode<T>>(
  a: N,
  onRotate?: (a: BTNode<T>, b: BTNode<T>) => void
): SingleLeft<T, N> {
  if (!a.right) return a as SingleLeft<T, N & { right: undefined }>
  const b = a.right

  const newRoot = { ...b, left: { ...a, right: b.left } }

  if (onRotate !== undefined) {
    onRotate(newRoot.left, newRoot)
  }

  return newRoot as SingleLeft<T, N & { right: BTNode<T> }>
}

/**
 * When given a root node for the tree matching `c` in
 *
 * ```
 *   c
 *  /
 * a
 *  \
 *   b
 * ```
 *
 * Rotates the tree to
 *
 * ```
 * a
 *  \
 *   c
 *  /
 * b
 * ```
 *
 * Then calls the `onRotate` function (if defined) on `a` and `c` (in that
 * order).
 *
 * Finally returns the new root, `a`.
 *
 * If there is no left child on `c`, just returns `c` with no modification.
 *
 * In reality, the nodes whose left and right children seem to be changing are
 * being replaced by (shallow) copies of the nodes whose children will be
 * updated. This makes sure that unwanted side-effects can be avoided.
 *
 * @param c The root of the original tree
 * @param onRotate A callback that is called with the nodes `b` and `c`.
 * @returns The new root, `a`.
 */
export function singleRight<T, N extends BTNode<T>>(
  c: N,
  onRotate?: (a: BTNode<T>, c: BTNode<T>) => void
): SingleRight<T, N> {
  if (!c.left) return c as SingleRight<T, N & { left: undefined }>
  const b = c.left

  const newRoot = { ...b, right: { ...c, left: b.right } }

  if (onRotate !== undefined) {
    onRotate(newRoot, newRoot.right)
  }

  return newRoot as SingleRight<T, N & { left: BTNode<T> }>
}

/**
 * When given a root node for a tree matching `a` in
 *
 * ```
 * a
 *  \
 *   c
 *  /
 * b
 * ```
 *
 * First rotates the subtree rooted at `c` right, and then rotates the resultant
 * tree left at `a` to get
 *
 * ```
 *    b
 *  /   \
 * a     c
 * ```
 *
 * Both rotations will call the respective `onRight` and `onLeft` callbacks on
 * `b` `c` and `a` `b` respectively.
 *
 * @see [[singleLeft]]
 * @see [[singleRight]]
 *
 * @param a The root node that will be rotated
 * @param onLeft Used as the onRotate method for the [[singleLeft]]
 * @param onRight Used as the onRotate method for the [[singleRight]]
 * @returns The new root, `b`.
 */
export function doubleLeft<T, N extends BTNode<T>>(
  a: N,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): DoubleLeft<T, N> {
  if (a.right === undefined) return a as DoubleLeft<T, N & { right: undefined }>
  return singleLeft(
    { ...a, right: singleRight(a.right, onRight) },
    onLeft
  ) as DoubleLeft<T, N & { right: BTNode<T> }>
}

/**
 * When given the root node for a tree matching `c` in
 *
 * ```
 *   c
 *  /
 * a
 *  \
 *   b
 * ```
 * First rotates the subtree rooted at `a` left, and then rotates the resultant
 * tree right at `c` to get
 *
 *
 * ```
 *    b
 *  /   \
 * a     c
 * ```
 *
 * Both rotations will call the respective `onLeft` and `onRight` callbacks on
 * `a` `b` and `b` `c` respectively.
 *
 * @see [[singleLeft]]
 * @see [[singleRight]]
 *
 * @param c The root node that will be rotated
 * @param onLeft Used as the onRotate method for the [[singleLeft]]
 * @param onRight Used as the onRotate method for the [[singleRight]]
 * @returns The new root, `b`.
 */
export function doubleRight<T, N extends BTNode<T>>(
  c: N,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): DoubleRight<T, N> {
  if (c.left === undefined) return c as DoubleRight<T, N & { left: undefined }>
  return singleRight(
    { ...c, left: singleLeft(c.left, onLeft) },
    onRight
  ) as DoubleRight<T, N & { left: BTNode<T> }>
}

/**
 * Returns an api to the methods in this module with specific default `onLeft`
 * and `onRight` methods.
 *
 * @param onLeft The function to call on nodes before they are rotated left
 * @param onRight The function to call on nodes before they are rotated right.
 *
 * @example
 * ```typescript
 * const rotate = rotateWith<{ weight: number }>(
 *   (a, b) => {
 *     a.data.size -= (b.right?.data.size ?? 0) + 1
 *     b.data.size += (a.left?.data.size ?? 0) + 1
 *   },
 *   (b, c) => {
 *     b.data.size += (c.right?.data.size ?? 0) + 1
 *     c.data.size -= (b.left?.data.size ?? 0) + 1
 *   },
 * )
 * ```
 */
export function rotateWith<T>(
  defaultOnLeft: <S extends T>(a: BTNode<T & S>, b: BTNode<T & S>) => void,
  defaultOnRight: <S extends T>(b: BTNode<T & S>, c: BTNode<T & S>) => void
) {
  return {
    singleLeft<S extends T, N extends BTNode<T & S>>(
      root: N,
      onLeft = defaultOnLeft
    ) {
      return singleLeft<T & S, N>(root, onLeft)
    },
    singleRight<S extends T, N extends BTNode<T & S>>(
      root: N,
      onRight = defaultOnRight
    ) {
      return singleRight<T & S, N>(root, onRight)
    },
    doubleLeft<S extends T, N extends BTNode<T & S>>(
      root: N,
      onLeft = defaultOnLeft,
      onRight = defaultOnRight
    ) {
      return doubleLeft<T & S, N>(root, onLeft, onRight)
    },
    doubleRight<S extends T, N extends BTNode<T & S>>(
      root: N,
      onLeft = defaultOnLeft,
      onRight = defaultOnRight
    ) {
      return doubleRight<T & S, N>(root, onLeft, onRight)
    },
  }
}
