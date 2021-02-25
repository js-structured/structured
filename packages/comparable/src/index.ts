import { enumerate, zipLongest } from '@structured/iterable'

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
 * Relatively common pattern; wraps a generic type with Comparator. Similar to
 * Readonly or Promisify.
 */
export type Comparatorify<T> = { [K in keyof T]: Comparator<T[K]> }

/**
 * A common comparator for numbers. Will cause an array of numbers to be sorted
 * into increasing order by `Array.prototype.sort(numberIncreasing)`.
 */
export const numberIncreasing: Comparator<number> = (a, b) => a - b

/**
 * A common comparator for strings. Will cause an array of numbers to be sorted
 * into increasing lexicographical order by
 * `Array.prototype.sort(stringIncreasing)`.
 */
export const stringIncreasing: Comparator<string> = (a, b) =>
  a < b ? -1 : a > b ? 1 : 0

/**
 * "Reverses" a compare function. That is, reverses the meaning of less than and
 * greater than for a compare fucntion:
 *
 * ```typescript
 * import { numberIncreasing, reverseCompare } from '@structured/comparable'
 *
 * const arr: number[] = [1, 10, 2999, 18, 22, 5]
 *
 * arr.sort(numberIncreasing)                 // 1, 5, 10, 18, 22, 2999
 * arr.sort(reverseCompare(numberIncreasing)) // 2999, 22, 18, 10, 5, 1
 * ```
 *
 * @param compare The compare function to reverse.
 */
export function reverseCompare<T>(compare: Comparator<T>): Comparator<T> {
  return (a, b) => -compare(a, b)
}

/**
 * A private function that serves the asis for both getTupleComparator and
 * getIterableComparator.
 */
function _getMultiComparator<T extends unknown[]>(
  ...compare: Comparatorify<T>
): Comparator<T> {
  return (aTuple, bTuple) => {
    for (const [i, [a, b]] of enumerate(zipLongest(aTuple, bTuple))) {
      // If both are undefined, we have finished both iterators.
      if (a === undefined) {
        return -1
      } else if (b === undefined) {
        return 1
      }
      const d = compare[i % compare.length](a, b)
      if (d < 0) {
        return -1
      } else if (d > 0) {
        return 1
      }
      // Otherwise continue to the next
    }
    return 0
  }
}

/**
 * Wraps multiple compare methods to compare tuples lexicographically.
 *
 * @param compareMethods Methods to compare the values at each index in the
 * tuple.
 * @returns A comparator that will compare tuples lexicographically.
 */
export function getTupleComparator<T extends unknown[]>(
  ...compareMethods: Comparatorify<T>
): Comparator<T> {
  return _getMultiComparator(...compareMethods)
}

/**
 * Wraps a compare method to compare iterables lexicographically.
 *
 * @param compare A comparator for single values
 * @returns A comparator that will compare iterables (of values comparable by
 * compare) lexicographically.
 */
export function getIterableComparator<T>(
  compare: Comparator<T>
): Comparator<Iterable<T>> {
  // We assert the type here because we know how _getMultiComparator is
  // implemented.
  return _getMultiComparator(compare) as Comparator<Iterable<T>>
}
