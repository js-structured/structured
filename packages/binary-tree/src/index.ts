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
 * The type of a node after it is rotated left. Assumes the node can be rotated
 * left.
 */
export type SingleLeft<T, N extends BTNode<T> & { right: BTNode<T> }> = T &
  N['right'] extends infer R
  ? R extends BTNode<T>
    ? R['left'] extends infer L
      ? L extends BTNode<T> | undefined
        ? UpdateLeft<T, R, UpdateRight<T, N, L>>
        : never
      : never
    : never
  : never

/**
 * The type of a node after it is rotated right. Assumes the node can be rotated
 * left.
 */
export type SingleRight<T, N extends BTNode<T> & { left: BTNode<T> }> = T &
  N['left'] extends infer L
  ? L extends BTNode<T>
    ? L['right'] extends infer R
      ? R extends BTNode<T> | undefined
        ? UpdateRight<T, L, UpdateLeft<T, N, R>>
        : never
      : never
    : never
  : never

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
 * Calls `onRotate` on `a` and `c` (in that order). Then rotates the tree to
 *
 * ```
 *   c
 *  /
 * a
 *  \
 *   b
 * ```
 *
 * And returns the new root, `c`. All other nodes are unchanged.
 *
 * If there is no right child on `a`, just returns `a` with no modification.
 *
 * @param a The node `a`
 * @param onRotate A callback that is called with the nodes `a` and `b`.
 * @returns The new root, `c`.
 */
export function singleLeft<T, N extends BTNode<T> & { right: BTNode<T> }>(
  a: N,
  onRotate?: (a: N, b: N['right']) => void
): SingleLeft<T, N>
// If the call didnt match the first signature there must be no right child
export function singleLeft<T, N extends BTNode<T> & { right?: undefined }>(
  a: N,
  onRotate?: (a: BTNode<T>, b: BTNode<T>) => void
): N
export function singleLeft<T, N extends BTNode<T>>(
  a: N,
  onRotate?: (a: BTNode<T>, b: BTNode<T>) => void
): BTNode<T>
export function singleLeft<T>(
  a: BTNode<T>,
  onRotate?: (a: BTNode<T>, b: BTNode<T>) => void
): BTNode<T> {
  if (a.right === undefined) return a
  const b = a.right

  if (onRotate !== undefined) {
    onRotate(a, b)
  }

  return { ...b, left: { ...a, right: b.left } }
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
 * Calls the `onRotate` function (if defined) on `a` and `c` (in that order).
 * Then rotates the tree to
 *
 * ```
 * a
 *  \
 *   c
 *  /
 * b
 * ```
 *
 * And returns the new root, `a`. All other nodes are unchanged.
 *
 * If there is no left child on `c`, just returns `c` with no modification.
 *
 * @param c The root of the original tree
 * @param onRotate A callback that is called with the nodes `b` and `c`.
 * @returns The new root, `a`.
 */
export function singleRight<T, N extends BTNode<T> & { left: BTNode<T> }>(
  c: N,
  onRotate?: (a: N['left'], c: N) => void
): SingleRight<T, N>
export function singleRight<T, N extends BTNode<T> & { left?: undefined }>(
  a: N,
  onRotate?: (a: BTNode<T>, b: BTNode<T>) => void
): N
export function singleRight<T>(
  c: BTNode<T>,
  onRotate?: (a: BTNode<T>, c: BTNode<T>) => void
): BTNode<T>
export function singleRight<T>(
  c: BTNode<T>,
  onRotate?: (a: BTNode<T>, c: BTNode<T>) => void
): BTNode<T> {
  if (c.left === undefined) return c
  const b = c.left

  if (onRotate !== undefined) {
    onRotate(b, c)
  }

  return { ...b, right: { ...c, left: b.right } }
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
export function doubleLeft<
  T,
  N extends BTNode<T> & { right: BTNode<T> & { left: BTNode<T> } }
>(
  a: N,
  onLeft?: (
    a: UpdateRight<T, N, typeof b>,
    b: SingleRight<T, N['right']>
  ) => void,
  onRight?: (c: N['right'], b: N['right']['left']) => void
): SingleLeft<T, UpdateRight<T, N, SingleRight<T, N['right']>>>
export function doubleLeft<
  T,
  N extends BTNode<T> & { right: BTNode<T> & { left?: undefined } }
>(
  a: N,
  onLeft?: (a: N, b: N['right']) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): SingleLeft<T, N>
export function doubleLeft<T, N extends BTNode<T> & { right?: undefined }>(
  a: N,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): N
export function doubleLeft<T>(
  a: BTNode<T>,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): BTNode<T>
export function doubleLeft<T>(
  a: BTNode<T>,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): BTNode<T> {
  if (a.right === undefined) return a
  return singleLeft({ ...a, right: singleRight(a.right, onRight) }, onLeft)
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
export function doubleRight<
  T,
  N extends BTNode<T> & { left: BTNode<T> & { right: BTNode<T> } }
>(
  c: N,
  onLeft?: (a: N['left'], b: N['left']['right']) => void,
  onRight?: (b: SingleLeft<T, N['left']>, c: UpdateLeft<T, N, typeof b>) => void
): SingleRight<T, UpdateLeft<T, N, SingleLeft<T, N['left']>>>
export function doubleRight<
  T,
  N extends BTNode<T> & { left: BTNode<T> & { right?: undefined } }
>(
  a: N,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (a: N['left'], c: N) => void
): SingleRight<T, N>
export function doubleRight<T, N extends BTNode<T> & { left?: undefined }>(
  a: N,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): N
export function doubleRight<T>(
  a: BTNode<T>,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): BTNode<T>
export function doubleRight<T>(
  c: BTNode<T>,
  onLeft?: (a: BTNode<T>, b: BTNode<T>) => void,
  onRight?: (c: BTNode<T>, b: BTNode<T>) => void
): BTNode<T> {
  if (c.left === undefined) return c
  return singleRight({ ...c, left: singleLeft(c.left, onLeft) }, onRight)
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
  defaultOnLeft: (a: BTNode<T>, b: BTNode<T>) => void,
  defaultOnRight: (b: BTNode<T>, c: BTNode<T>) => void
) {
  return {
    singleLeft(root: BTNode<T>, onLeft = defaultOnLeft) {
      return singleLeft(root, onLeft)
    },
    singleRight(root: BTNode<T>, onRight = defaultOnRight) {
      return singleRight(root, onRight)
    },
    doubleLeft(
      root: BTNode<T>,
      onLeft = defaultOnLeft,
      onRight = defaultOnRight
    ) {
      return doubleLeft(root, onLeft, onRight)
    },
    doubleRight(
      root: BTNode<T>,
      onLeft = defaultOnLeft,
      onRight = defaultOnRight
    ) {
      return doubleRight(root, onLeft, onRight)
    },
  }
}
