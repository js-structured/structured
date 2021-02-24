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

/**
 * The type of a node after being doubly rotated left.
 */
export type DoubleLeft<T, N extends BTNode<T> | undefined> = N extends BTNode<T>
  ? SingleLeft<T, UpdateRight<T, N, SingleRight<T, N['right']>>>
  : undefined

/**
 * The type of a node after being doubly rotated right.
 */
export type DoubleRight<
  T,
  N extends BTNode<T> | undefined
> = N extends BTNode<T>
  ? SingleRight<T, UpdateLeft<T, N, SingleLeft<T, N['left']>>>
  : undefined

/**
 * The type of a rotate callback. Rotate callbacks get called on the new nodes
 * (in inorder order) after a rotation has occurred. They should return a pair
 * of parameter overrides for the new nodes.
 *
 * It is important that we overwrite the values we want to change, but copy all
 * other values. This is to keep values that have been defined elsewhere
 * (perhaps upstream). This can be done with object spread.
 *
 * ```typescript
 * // The most basic callback.
 * const onRotate: RotateCallback<T> = (a, b) => [
 *  { ...a, changed: newValue },
 *  { ...b, change: newValue }
 * ]
 * ```
 */
export type RotateCallback<T, A extends T = any, B extends T = any> = (
  a: A,
  b: B
) => [A, B]

/**
 * Produces a method that will chain all onRotate callbacks and return their
 * result.
 *
 * @param onRotate The function call or calls that will update the props.
 */
export const getDeduceProps = <T>(
  onRotate: RotateCallback<T> | RotateCallback<T>[]
) => (aProps: T, bProps: T) =>
  (typeof onRotate === 'function' ? [onRotate] : onRotate).reduce<[T, T]>(
    (props, cb) => cb(...props),
    [aProps, bProps]
  )

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
 * Then calls `onRotate` on `a` and `c` (in that order). `onRotate` should
 * return copies of `a` and `c` with any updated properties, but leave left and
 * right unchanged.
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
export function singleLeft<T, N extends BTNode<T> | undefined>(
  a: N,
  onRotate: RotateCallback<T> | RotateCallback<T>[] = []
): SingleLeft<T, N> {
  if (!a?.right) return a as SingleLeft<T, N & { right: undefined }>
  const b = a.right

  const deduceProps = getDeduceProps(onRotate)

  const [aProps, bProps] = deduceProps((a as unknown) as T, (b as unknown) as T)

  return {
    ...bProps,
    left: {
      ...aProps,
      left: a.left,
      right: b.left,
    },
    right: b.right,
  } as SingleLeft<T, N & { right: BTNode<T> }>
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
export function singleRight<T, N extends BTNode<T> | undefined>(
  c: N,
  onRotate: RotateCallback<T> | RotateCallback<T>[] = []
): SingleRight<T, N> {
  if (!c?.left) return c as SingleRight<T, N & { left: undefined }>
  const b = c.left

  const deduceProps = getDeduceProps(onRotate)

  const [bProps, cProps] = deduceProps((b as unknown) as T, (c as unknown) as T)

  return {
    ...bProps,
    left: b.left,
    right: {
      ...cProps,
      left: b.right,
      right: c.right,
    },
  } as SingleRight<T, N & { left: BTNode<T> }>
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
export function doubleLeft<T, N extends BTNode<T> | undefined>(
  a: N,
  onLeft: RotateCallback<T> | RotateCallback<T>[] = [],
  onRight: RotateCallback<T> | RotateCallback<T>[] = []
): DoubleLeft<T, N> {
  if (!a?.right) return a as DoubleLeft<T, N & { right: undefined }>
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
export function doubleRight<T, N extends BTNode<T> | undefined>(
  c: N,
  onLeft: RotateCallback<T> | RotateCallback<T>[] = [],
  onRight: RotateCallback<T> | RotateCallback<T>[] = []
): DoubleRight<T, N> {
  if (!c?.left) return c as DoubleRight<T, N & { left: undefined }>
  return singleRight(
    { ...c, left: singleLeft(c.left, onLeft) },
    onRight
  ) as DoubleRight<T, N & { left: BTNode<T> }>
}

/**
 * Returns an api to the methods in this module will always call the passed
 * `onLeft` and `onRight` methods.
 *
 * @param onLeft The function(s) to call on nodes before they are rotated left
 * @param onRight The function(s) to call on nodes before they are rotated right
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
  onLeft: RotateCallback<T> | RotateCallback<T>[],
  onRight: RotateCallback<T> | RotateCallback<T>[]
) {
  return {
    singleLeft<S extends T, N extends BTNode<S> | undefined>(
      root: N,
      alsoOnLeft: RotateCallback<S> | RotateCallback<S>[] = []
    ) {
      return singleLeft<S, N>(root, [onLeft, alsoOnLeft].flat())
    },
    singleRight<S extends T, N extends BTNode<S> | undefined>(
      root: N,
      alsoOnRight: RotateCallback<S> | RotateCallback<S>[] = []
    ) {
      return singleRight<S, N>(root, [onRight, alsoOnRight].flat())
    },
    doubleLeft<S extends T, N extends BTNode<S> | undefined>(
      root: N,
      alsoOnLeft: RotateCallback<S> | RotateCallback<S>[] = [],
      alsoOnRight: RotateCallback<S> | RotateCallback<S>[] = []
    ) {
      return doubleLeft<S, N>(
        root,
        [onLeft, alsoOnLeft].flat(),
        [onRight, alsoOnRight].flat()
      )
    },
    doubleRight<S extends T, N extends BTNode<S> | undefined>(
      root: N,
      alsoOnLeft: RotateCallback<S> | RotateCallback<S>[] = [],
      alsoOnRight: RotateCallback<S> | RotateCallback<S>[] = []
    ) {
      return doubleRight<S, N>(
        root,
        [onLeft, alsoOnLeft].flat(),
        [onRight, alsoOnRight].flat()
      )
    },
  }
}

/**
 * Use of this method should be unneccesary. Since the tree nodes should be
 * immutable, copying of a tree will offer no benefit.
 *
 * @param root The root of the tree to copy.
 * @deprecated
 */
export function deepCopy<N extends BTNode | undefined>(root: N): N {
  if (!root) return root

  const result = { ...root }

  if ('left' in root) {
    // We are ignoring two things here:
    // - The result may be undefined; Not possible, since root was defined.
    // - The left property on BTNode is readonly. We want to update our partial
    //   result so that the left child is not a copy by reference.

    // @ts-ignore
    result.left = deepCopy(root.left)
  }

  if ('right' in root) {
    // See above for explanation as to why we ignore.

    // @ts-ignore
    result.right = deepCopy(root.right)
  }

  return result

  // The following is potentially easier to read, but it will cause objects like
  // { v: 'a' } to be copied to { v: 'a', left: undefined, right: undefined }.
  // This would cause different behaviour with Object.keys etc. so we want to
  // avoid that.

  // return (
  //   root && {
  //     ...root,
  //     left: deepCopy(root.left),
  //     right: deepCopy(root.right),
  //   }
  // )
}
