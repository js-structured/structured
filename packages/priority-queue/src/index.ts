/**
 * A Function to compare two values of the same type `T`.
 *
 * The return value should be a number, v, such that
 *
 * - If value `a` is less than value `b`, v is negative.
 * - If value `a` is greater than value `b`, v is positive.
 * - If value `a` is equal to value `b`, v is zero.
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * The default comparator for the heap actions. It is defined this way to be
 * consistent with the
 * [`Array.prototype.sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
 * function.
 */
export const defaultCompare: Comparator<unknown> = (a, b) => {
  const strA = String(a)
  const strB = String(b)

  return strA < strB ? -1 : strA > strB ? 1 : 0
}

/**
 * Bubbles smaller elements below an index up.
 */
function _bubbleUp<T>(
  heap: T[],
  idx: number,
  compare: Comparator<T> = defaultCompare
): void {
  while (idx < heap.length) {
    const left = 2 * idx + 1
    const right = 2 * idx + 2
    let ext = idx

    if (left < heap.length && compare(heap[left], heap[ext]) < 0) {
      ext = left
    }

    if (right < heap.length && compare(heap[right], heap[ext]) < 0) {
      ext = right
    }

    if (ext === idx) {
      // The heap substructure is properly maintained
      return
    }
    ;[heap[idx], heap[ext]] = [heap[ext], heap[idx]]
    idx = ext
  }
}

/** Bubbles larger elements above a given index down. */
function _bubbleDown<T>(
  heap: T[],
  idx: number,
  compare: Comparator<T> = defaultCompare
): void {
  while (idx > 0) {
    // The parent index
    const p = (idx - 1) >> 1

    if (compare(heap[idx], heap[p]) < 0) {
      ;[heap[idx], heap[p]] = [heap[p], heap[idx]]
      idx = p
    } else {
      return
    }
  }
}

/**
 * "Sorts" an array in-place into a min-heap according to the passed comparator.
 */
export function heapify<T>(
  arr: T[],
  compare: Comparator<T> = defaultCompare
): void {
  for (let i = arr.length >> 1; i >= 0; i--) {
    _bubbleUp(arr, i, compare)
  }
}

/**
 * Adds a new element to a heap while keeping the heap substructure (according
 * to the comparator).
 */
export function heappush<T>(
  heap: T[],
  value: T,
  compare: Comparator<T> = defaultCompare
): void {
  heap.push(value)
  _bubbleDown(heap, heap.length - 1, compare)
}

/**
 * Removes and returns the minimum element from the heap while maintaining the
 * heap substructure.
 */
export function heappop<T>(
  heap: T[],
  compare: Comparator<T> = defaultCompare
): T | undefined {
  if (heap.length <= 1) {
    return heap.pop()
  }
  const result = heap[0]
  // since the length of the heap is at least 2, the popped value will be
  // defined.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  heap[0] = heap.pop()!

  _bubbleUp(heap, 0, compare)

  return result
}

/**
 * Pushes `value` onto the heap, then pops to return the minimum element in the
 * heap.
 *
 * This combined action runs faster than a push followed by a pop.
 *
 * This may return the value that was to be added, leaving the heap unchanged.
 * If this is not the intended use, consider using `heapreplace`.
 *
 * @see [[heapreplace]]
 */
export function heappushpop<T>(
  heap: T[],
  value: T,
  compare: Comparator<T> = defaultCompare
): T {
  if (heap.length === 0 || compare(value, heap[0]) < 0) {
    return value
  }
  const result = heap[0]

  heap[0] = value
  _bubbleUp(heap, 0, compare)

  return result
}

/**
 * Pops the minimum element from the heap and then pushes `value` onto the heap.
 *
 * Faster than a pop followed by a push.
 *
 * The returned element may be larger than the value added. If this is not
 * desired, consider using `heappushpop` instead.
 *
 * @see [[heappushpop]]
 */
export function heapreplace<T>(
  heap: T[],
  value: T,
  compare: Comparator<T> = defaultCompare
): T | undefined {
  // If the heap is currently empty, heap[0] will be undefined.
  const result = heap[0]
  // When we run this, the length will update to 1 if it was previously 0.
  heap[0] = value

  _bubbleUp(heap, 0, compare)
  return result
}

/**
 * Provides a wrapper for the heap methods in this module to set the compare
 * method.
 *
 * Useful for defining a max-heap, or a heap that compares numbers by their
 * value instead of their string representation.
 *
 * This functionality can be obtained by instead explicitly stating the custom
 * compare method every time, but that might become quite verbose. It may even
 * be a source for bugs, as omitting the compare function is not a typescript
 * error.
 *
 * @example
 * ```ts
 * // Normal heapify:
 * // Puts 10 ahead of 5 because it compares elements by their string
 * // representation.
 * heapify([100, 10, 5, 50]) // [10, 100, 5, 50]
 *
 * // Redefined heapify:
 * // The true min (5) is at the front.
 * const { heapify } = useDefaultCompare((a, b) => a - b)
 * heapify([100, 10, 5, 50]) // [5, 10, 100, 50]
 * ```
 */
export function compareWith<T>(compare: Comparator<T>) {
  return {
    heapify<S extends T>(arr: S[]) {
      heapify(arr, compare)
    },
    heappush<S extends T>(heap: S[], value: S) {
      heappush(heap, value, compare)
    },
    heappop<S extends T>(heap: S[]) {
      return heappop(heap, compare)
    },
    heappushpop<S extends T>(heap: S[], value: S) {
      return heappushpop(heap, value, compare)
    },
    heapreplace<S extends T>(heap: S[], value: S) {
      return heapreplace(heap, value, compare)
    },
  }
}
