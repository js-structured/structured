export interface BTNode extends Object {
  left?: BTNode
  right?: BTNode
}

/**
 * Updates the type of the left child of a node.
 *
 * @template N The original node.
 * @template L The new type for the left child.
 */
export type UpdateLeft<
  N extends BTNode,
  L extends BTNode | undefined
> = N extends { left: BTNode | undefined }
  ? { [K in keyof N]: K extends 'left' ? L : N[K] }
  : N & { left: L }

/**
 * Updates the type of the right child of a node.
 *
 * @template N The original node.
 * @template R The new type for the right child.
 */
export type UpdateRight<
  N extends BTNode,
  R extends BTNode | undefined
> = N extends { right: BTNode | undefined }
  ? { [K in keyof N]: K extends 'right' ? R : N[K] }
  : N & { right: R }

/**
 * The type of a node after it is rotated left. Assumes the node can be rotated
 * left.
 */
export type SingleLeft<N extends { right: BTNode }> = N['right'] extends infer R
  ? R extends BTNode
    ? R['left'] extends infer L
      ? L extends BTNode | undefined
        ? UpdateLeft<R, UpdateRight<N, L>>
        : never
      : never
    : never
  : never

/**
 * The type of a node after it is rotated right. Assumes the node can be rotated
 * left.
 */
export type SingleRight<N extends { left: BTNode }> = N['left'] extends infer L
  ? L extends BTNode
    ? L['right'] extends infer R
      ? R extends BTNode | undefined
        ? UpdateRight<L, UpdateLeft<N, R>>
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
export function singleLeft<N extends BTNode & { right: BTNode }>(
  a: N,
  onRotate?: (a: N, b: N['right']) => void
): SingleLeft<N>
// If the call didnt match the first signature there must be no right child
export function singleLeft<N extends BTNode & { right?: undefined }>(
  a: N,
  onRotate?: (a: BTNode, b: BTNode) => void
): N
export function singleLeft(
  a: BTNode,
  onRotate?: (a: BTNode, b: BTNode) => void
): BTNode
export function singleLeft(
  a: BTNode,
  onRotate?: (a: BTNode, b: BTNode) => void
): BTNode {
  if (a.right === undefined) return a
  const b = a.right

  if (onRotate !== undefined) {
    onRotate(a, b)
  }

  a.right = b.left
  b.left = a
  return b
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
export function singleRight<N extends BTNode & { left: BTNode }>(
  c: N,
  onRotate?: (a: N['left'], c: N) => void
): SingleRight<N>
export function singleRight<N extends BTNode & { left?: undefined }>(
  a: N,
  onRotate?: (a: BTNode, b: BTNode) => void
): N
export function singleRight(
  c: BTNode,
  onRotate?: (a: BTNode, c: BTNode) => void
): BTNode
export function singleRight(
  c: BTNode,
  onRotate?: (a: BTNode, c: BTNode) => void
): BTNode {
  if (c.left === undefined) return c
  const b = c.left

  if (onRotate !== undefined) {
    onRotate(b, c)
  }

  c.left = b.right
  b.right = c
  return b
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
  N extends BTNode & { right: BTNode & { left: BTNode } }
>(
  a: N,
  onLeft?: (a: UpdateRight<N, typeof b>, b: SingleRight<N['right']>) => void,
  onRight?: (c: N['right'], b: N['right']['left']) => void
): SingleLeft<UpdateRight<N, SingleRight<N['right']>>>
export function doubleLeft<
  N extends BTNode & { right: BTNode & { left?: undefined } }
>(
  a: N,
  onLeft?: (a: N, b: N['right']) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): SingleLeft<N>
export function doubleLeft<N extends BTNode & { right?: undefined }>(
  a: N,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): N
export function doubleLeft(
  a: BTNode,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): BTNode
export function doubleLeft(
  a: BTNode,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): BTNode {
  if (a.right === undefined) return a
  a.right = singleRight(a.right, onRight)
  return singleLeft(a, onLeft)
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
  N extends BTNode & { left: BTNode & { right: BTNode } }
>(
  c: N,
  onLeft?: (a: N['left'], b: N['left']['right']) => void,
  onRight?: (b: SingleLeft<N['left']>, c: UpdateLeft<N, typeof b>) => void
): SingleRight<UpdateLeft<N, SingleLeft<N['left']>>>
export function doubleRight<
  N extends BTNode & { left: BTNode & { right?: undefined } }
>(
  a: N,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (a: N['left'], c: N) => void
): SingleRight<N>
export function doubleRight<N extends BTNode & { left?: undefined }>(
  a: N,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): N
export function doubleRight(
  a: BTNode,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): BTNode
export function doubleRight(
  c: BTNode,
  onLeft?: (a: BTNode, b: BTNode) => void,
  onRight?: (c: BTNode, b: BTNode) => void
): BTNode {
  if (c.left === undefined) return c
  c.left = singleLeft(c.left, onLeft)
  return singleRight(c, onRight)
}
