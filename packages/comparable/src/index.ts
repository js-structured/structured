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
