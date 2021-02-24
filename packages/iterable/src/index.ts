import { Tuple } from 'tuple-type'
import { compareWith } from '@structured/priority-queue'

type Iterableify<T> = { [P in keyof T]: Iterable<T[P]> }

/**
 * When given an iterator (possibly finished), provides a generator to iterate
 * over the remaining values of the iterator.
 */
function* _tailIterable<T>(iterator: Iterator<T>): Generator<T> {
  let value: T | undefined
  while (!({ value } = iterator.next()).done) {
    yield value as T
  }
}

/**
 * An iterator over the prefix sums of the number iterable.
 *
 * @example
 * ```ts
 * accumulate([1, 2, 3, 4]) // 1 3 6 10
 * ```
 */
export function accumulate(iterable: Iterable<number>): Generator<number>
/**
 * Similar to reduce_, but provides an iterator to the accumulated values.
 *
 * Calls the reducer with an undefined accumulated value on the first value in
 * the iterator to produce the initial value.
 *
 * @see [[reduce_]]
 *
 * @example
 * ```ts
 * accumulate(['bing', 'bang', 'bong'], (n, s) => (n ?? 0) + s.length) // 4, 8, 12
 * ```
 */
export function accumulate<T, R>(
  iterable: Iterable<T>,
  reducer: (accumulated: R | undefined, nextVal: T) => R
): Generator<R>
/**
 * Similar to reduce, but provides an iterator over the accumulated values.
 *
 * Yields the initial value first.
 *
 * @see [[reduce]]
 *
 * @example
 * ```ts
 * accumulate(['bing', 'bang', 'bong'], (n, s) => n + s.length, 0) // 0, 4, 8, 12
 * ```
 */
export function accumulate<T, R>(
  iterable: Iterable<T>,
  reducer: (accumulated: R, nextItem: T) => R,
  initial: R
): Generator<R>
export function* accumulate<T, R>(
  iterable: Iterable<T>,
  reducer?: (a: R, b: T) => R,
  initial?: R
): Generator<R> {
  const iterator = iterable[Symbol.iterator]()

  let accumulated: R

  if (initial === undefined) {
    const { value, done } = iterator.next()
    if (done) {
      return
    }

    // The initial value is the first value of the iterator.
    if (reducer === undefined) {
      const defaultReducer = (a: number | undefined, b: T) => {
        if (typeof b !== 'number') {
          throw new TypeError(
            'The reducer must be specified for non-nummber types.'
          )
        }
        return (a ?? 0) + b
      }
      reducer = (defaultReducer as unknown) as (a: R, b: T) => R
      accumulated = value
    } else {
      // Since initial was undefined and reducer was defined, the matching
      // overload signature must mean reducer is of type (acc: R | undefined,
      // next: T) => R
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      accumulated = reducer(undefined!, value)
    }
  } else {
    accumulated = initial
  }

  yield accumulated
  for (const item of _tailIterable(iterator)) {
    // The only overload signature with an undefined reducer also has the
    // initial value undefined. In this case, we defined the reducer above.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulated = reducer!(accumulated, item)
    yield accumulated
  }
}

/**
 * Returns true when all of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for the specific
 * iterator.
 *
 * @example
 * ```ts
 * all([])                           // true
 * all([0])                          // false
 * all([0, 1, 2])                    // false
 * all([1, 2, 3])                    // true
 *
 * all([2, 4, 6], n => n % 2 === 0)  // true
 * all([2, 4, 5], n => n % 2 === 0)  // false
 * ```
 */
export function all<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean = Boolean
): boolean {
  for (const item of iterable) {
    if (!predicate(item)) {
      return false
    }
  }
  return true
}

/**
 * Returns true when all of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for the specific
 * iterator.
 *
 * @example
 * ```ts
 * any([])                           // false
 * any([0])                          // false
 * any([0, 1, 2])                    // true
 * any([1, 2, 3])                    // true
 *
 * any([2, 4, 6], n => n % 2 === 0)  // true
 * any([2, 4, 5], n => n % 2 === 0)  // true
 * ```
 */
export function any<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean = Boolean
): boolean {
  return !all(iterable, (item) => !predicate(item))
}

/**
 * An iterator over multiple iterators in order.
 *
 * @example
 * ```ts
 * [...chain("Help", [1, 2, 3])].join('') // "Help123"
 * ```
 */
export function* chain<T>(...toChain: Iterable<T>[]): Generator<T> {
  for (const iterable of toChain) {
    for (const item of iterable) {
      yield item
    }
  }
}

/**
 * Alternate to chain. Gets chained inputs from a single iterable argument that
 * is evaluated lazily.
 *
 * @see [[chain]]
 */
export function* chainFromIterable<T>(
  toChain: Iterable<Iterable<T>>
): Generator<T> {
  for (const iterable of toChain) {
    for (const item of iterable) {
      yield item
    }
  }
}

/**
 * Iterates over the r-length subsequences of an iterable.
 *
 * The combination tuples are emitted in lexicographic ordering according to the
 * order of the input iterable. So, if the input iterable is sorted, the
 * combination tuples will be produced in sorted order.
 *
 * Elements are treated as unique based on their position, not on their value.
 * So if the input elements are unique, there will be no repeat values in each
 * combination.
 */
export function* combinations<T, N extends number>(
  iterable: Iterable<T>,
  r: N
): Generator<Tuple<T, N>> {
  const saved: T[] = [...iterable]
  const n = saved.length

  if (r > n) {
    return
  }

  const indicies = [...range(r)]

  for (;;) {
    yield indicies.map((i) => saved[i]) as Tuple<T, N>
    let i = r - 1
    for (; i >= 0; i--) {
      if (indicies[i] !== i + n - r) {
        break
      }
    }
    if (i === -1) {
      break
    }
    indicies[i] += 1
    for (let j = i + 1; j < r; j++) {
      indicies[j] = indicies[j - 1] + 1
    }
  }
}

/**
 * Iterates over the r length subsequences of elements from the input iterable
 * allowing individual elements to be repeated more than once.
 *
 * The combination tuples are emitted in lexicographic ordering according to the
 * order of the input iterable. So, if the input iterable is sorted, the
 * combination tuples will be produced in sorted order.
 *
 * Elements are treated as unique based on their position, not on their value.
 * So if the input elements are unique, the generated combinations will also be
 * unique.
 *
 * @see [[combinations]]
 *
 * @example
 * ```ts
 * combinationsWithReplacement('ABC', 2) // AA AB BB AC BC CC
 * ```
 */
export function* combinationsWithReplacement<T, N extends number>(
  iterable: Iterable<T>,
  r: N
): Generator<Tuple<T, N>> {
  const saved = [...iterable]
  const n = saved.length

  if (n === 0 && r !== 0) {
    return
  }

  const indicies = Array(r).fill(0)

  for (;;) {
    yield indicies.map((i) => saved[i]) as Tuple<T, N>

    let i = r - 1
    for (; i >= 0; i--) {
      if (indicies[i] !== n - 1) {
        break
      }
    }
    if (i === -1) {
      break
    }
    indicies[i] += 1
    for (let j = i + 1; j < r; j++) {
      indicies[j] = indicies[j - 1]
    }
  }
}

/**
 * Returns true when any of the items in the iterable are equal (===) to the
 * target object.
 *
 * @example
 * ```ts
 * contains([], 'whatever') // => false
 * contains([3], 42) // => false
 * contains([3], 3) // => true
 * contains([{}, {}], {}) // => false, since comparison is done with ===
 * ```
 */
export function contains<T>(haystack: Iterable<T>, needle: T): boolean {
  return any(haystack, (value) => value === needle)
}

/**
 * Iterates the infinite sequence of start, start + step, start + 2 * step,...
 *
 * Be careful to avoid calculating the entire sequence.
 *
 * Defaults to `start = 0` and `step = 1`.
 *
 * @example
 * ```ts
 * // good
 * const it = count(5, 2)
 * it.next() // 5
 * it.next() // 7
 * it.next() // 9
 *
 * //bad
 * [...count(5, 3)] // Infinite loop!
 * ```
 */
export function* count(start = 0, step = 1): Generator<number> {
  for (let i = start; ; i += step) {
    yield i
  }
}

/**
 * Make an iterator yielding elements from the iterable and saving a copy of
 * each. When the iterable is exhausted, yields elements from the saved copy.
 * Repeats indefinitely.
 *
 * @example
 * ```ts
 * const it = cycle([1, 2, 3])
 * it.next() // 1
 * it.next() // 2
 * it.next() // 3
 * it.next() // 1
 * ```
 */
export function* cycle<T>(iterable: Iterable<T>): Generator<T> {
  const saved = []

  for (const item of iterable) {
    yield item
    saved.push(item)
  }

  while (saved.length > 0) {
    for (const item of saved) {
      yield item
    }
  }
}

/**
 * An iterator that drops elements from the passed iterable as long as the
 * predicate is true; afterwards, returns every element. Note, the iterator does
 * not produce any output until the predicate first becomes false, so it may
 * have a lengthy start-up time.
 *
 * Defaults to the truthyness of values for the predicate.
 */
export function* dropWhile<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean = Boolean
): Generator<T> {
  const iterator = iterable[Symbol.iterator]()
  let value: T

  while (!({ value } = iterator.next()).done) {
    if (!predicate(value)) {
      yield value
      break
    }
  }

  yield* _tailIterable(iterator)
}

/**
 * Returns a generator of enumeration pairs. Iterable must be an object which
 * supports iteration. Produces tuples of the order of each element and the
 * element itself.
 *
 * @example
 * ```ts
 * [...enumerate(['hello', 'world'])] // [[0, 'hello'], [1, 'world']]
 * [...enumerate([5,4,3,2,1].splice(2), 1)] // [[1, 3], [2, 2], [3, 1]]
 * ```
 */
export function* enumerate<T>(
  iterable: Iterable<T>,
  start = 0
): Generator<[number, T]> {
  yield* zip(count(start), iterable)
}

/**
 * Returns a generator that filters elements from a given iterable based on a
 * predicate.
 *
 * The predicate defaults to the boolean constructor; falsy values will be
 * filtered.
 *
 * @example
 * ```ts
 * [...filter([0, 1, 2, 3, 4], n => n % 2 === 0)] // [0, 2, 4]
 * [...filter('Hello World!', c => c.match(/[A-Z]/) !== null)] // ['H', 'W']
 * ```
 */
export function* filter<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean = Boolean
): Generator<T> {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item
    }
  }
}

/**
 * An iterator that returns unique values and groups of that value from the
 * iterable. Generally, the iterable needs to already be sorted.
 *
 * The operation is similar to the `uniq` filter in Unix. It generates a break
 * or new group every time the value changes (which is why it is usually
 * necessary to have sorted the data beforehand). This differs from SQL’s `GROUP
 * BY` which aggregates elements regardless of their input order.
 *
 * The group iterator is not saved as the iterator progresses; please pay
 * attention to the second example.
 *
 * @example
 * ```ts
 * const values = [0, 0, 1, 1]
 * for (const [k, g] of groupBy(values)) {
 *    console.log(`key = ${k}`)        // 0      1
 *    console.log(`group = ${[...g]}`) // [0, 0] [1, 1]
 * }
 *
 * [...groupBy(values)].map(([k, g]) => [...g]) // [[], []]
 *
 * // We could use the iterator version of map though.
 * [...map(([k, g]) => [...g], groupBy(values))] // [[0, 0], [1, 1]]
 * ```
 */
export function groupBy<T>(iterable: Iterable<T>): Generator<[T, Generator<T>]>
/**
 * An iterator that returns consecutive keys and groups from the iterable.
 * Generally, the iterable needs to already be sorted on the same key function.
 *
 * The operation is similar to the `uniq` filter in Unix. It generates a break
 * or new group every time the value of the key function changes (which is why
 * it is usually necessary to have sorted the data by the key function
 * beforehand). This differs from SQL’s `GROUP BY` which aggregates common
 * elements regardless of their input order.
 *
 * The group iterator is not saved as the iterator progresses; please pay
 * attention to the second example.
 *
 * @example
 * ```ts
 * const values = [0, 1, 2, 3, 1, 4, 5]
 * const keyFunc = v => Math.floor(v / 2)
 *
 * for (const [k, g] of groupBy(values, keyFunc)) {
 *    console.log(`key = ${k}`)
 *    // 0 1 0 2
 *    console.log(`group = ${[...g]}`)
 *    // [0, 1] [2, 3] [1] [4, 5]
 * }
 *
 * // The group iterators have all finished by the time we call `Array.prototype.map()`
 * [...groupBy(values, keyFunc)].map(([k, g]) => [...g])
 * // [[], [], [], []]
 *
 * // We could use the iterator version of map though.
 * [...map(([k, g]) => [...g], groupBy(values, keyFunc))]
 * // [[0, 1], [2, 3], [1], [4, 5]]
 * ```
 *
 * @param keyFunc A function computing a key value for each element.
 */
export function groupBy<T, K>(
  iterable: Iterable<T>,
  keyFunc: (item: T) => K
): Generator<[K, Generator<T>]>
export function* groupBy<T, K>(
  iterable: Iterable<T>,
  keyFunc?: (v: T) => K
): Generator<[K, Generator<T>]> {
  if (keyFunc === undefined) {
    // If the key value is to be a different type to the iterated values, then
    // a different overloaded method will be used.
    keyFunc = (v: T) => (v as unknown) as K
  }

  const it = iterable[Symbol.iterator]()

  // We need a dummy value to initialise the keys and values that will not be
  // equal to anything in the iterable.
  // When we start iterating, all three of these variables will be defined
  // before we yield them.
  let currKey: K = ({} as unknown) as K
  let targetKey: K = currKey
  let currValue: T = ({} as unknown) as T

  // A dummy object to notify the grouper when the next group has started.
  let id: Record<string, never> = {}

  const grouper = function* (
    targetId: Record<string, never>,
    keyFunc: (v: T) => K
  ) {
    while (id === targetId && currKey === targetKey) {
      yield currValue
      if (!({ value: currValue } = it.next()).done) {
        currKey = keyFunc(currValue)
      } else {
        // the iterator has finished
        return
      }
    }
  }

  while (true) {
    id = {}
    // Skip over the values with the same key.
    while (currKey === targetKey) {
      if (!({ value: currValue } = it.next()).done) {
        currKey = keyFunc(currValue)
      } else {
        // The iterator has finished.
        return
      }
    }
    // Update the key to the next value
    targetKey = currKey
    // Yield the current key and an iterator over the values with the same key.
    yield [currKey, grouper(id, keyFunc)]
  }
}

/**
 * An iterator that yields k elements from the iterable.
 */
export function islice<T>(iterable: Iterable<T>, k: number): Generator<T>
/**
 * An iterator that yields selected elements from the iterable. If `start` is
 * non-zero, then elements from the iterable are skipped until start is reached.
 * Afterward, elements are returned consecutively unless step is set higher than
 * one which results in items being skipped. Unlike regular slicing, islice()
 * does not support negative values for start, stop, or step.
 */
export function islice<T>(
  iterable: Iterable<T>,
  start: number,
  stop?: number,
  step?: number
): Generator<T>
export function* islice<T>(
  iterable: Iterable<T>,
  startOrEnd: number,
  endValue?: number,
  stepValue?: number
): Generator<T> {
  const enumerated = enumerate(iterable)
  let start: number
  let end: number
  let step: number

  if (endValue === undefined) {
    if (stepValue === undefined) {
      if (startOrEnd < 0) {
        throw new TypeError('k param must be non-negative or undefined')
      }
      start = 0
      end = startOrEnd
      step = 1
    } else {
      start = startOrEnd
      end = Infinity
      step = stepValue
    }
  } else {
    start = startOrEnd
    end = endValue
    step = stepValue ?? 1
  }
  if (start < 0) {
    throw new TypeError('start param must be non-negative or undefined')
  }
  if (end < 0) {
    throw new TypeError('end param must be non-negative or undefined')
  }
  if (step <= 0) {
    throw new TypeError('step param must be positive or undefined')
  }

  for (const select of takeWhile(count(start, step), (v) => v < end)) {
    for (;;) {
      const { done, value } = enumerated.next()
      if (done) {
        // The iterator is done and we will not yield any more.
        return
      }
      // Since we are not done, the value property will be of the correct type.
      const [i, val] = value as [number, T]
      if (i === select) {
        // We found the next value, yield it and move on to the next value.
        yield val
        break
      }
    }
  }
}

/**
 * Returns a generator over mapped elements from a given iterable based on a
 * given modifying function.
 *
 * @example
 * ```ts
 * [...map(n => 'a'.repeat(n), [0, 1, 2])] // ['', 'a', 'aa']
 * [...map(c => c.toUpperCase(), 'Hello World!')].join('') // 'HELLO WORLD!'
 * [...map((a, b) => a * b, [1, 2, 3], [4, 5, 6])] // [4, 10, 18]
 * ```
 */
export function* map<T extends unknown[], M>(
  mapper: (...values: T) => M,
  ...iterables: Iterableify<T>
): Generator<M> {
  for (const items of zip<T>(...iterables)) {
    yield mapper(...items)
  }
}

/**
 * Merges a number of iterables, each sorted according to compare, into a single
 * iterable sorted by compare.
 *
 * @param compare A comparator for the values in the iterables.
 * @param iterables A collection of sorted iterables.
 */
export function* merge<T>(
  compare: (a: T, b: T) => number,
  ...iterables: Iterable<T>[]
): Generator<T> {
  const heap: [T, Iterator<T>][] = iterables
    .map((it) => it[Symbol.iterator]())
    .map((it) => {
      const { value } = it.next()
      // value may still be undefined here, but we remove those with the filter.
      return [value, it] as [T, Iterator<T>]
    })
    .filter(([v]) => v) // Make sure no empty iterators are added to the heap.

  // We want to compare iterators by their next value.
  const {
    heapify,
    heappop,
    heapreplace,
  } = compareWith(([a]: [T, Iterator<T>], [b]: [T, Iterator<T>]) =>
    compare(a, b)
  )

  heapify(heap)

  while (heap.length) {
    const [next, it] = heap[0]
    yield next

    const { value, done } = it.next()

    if (done) {
      heappop(heap)
    } else {
      heapreplace(heap, [value, it])
    }
  }
}

/**
 * An iterator over the r-length permutations of the iterable.
 *
 * If r is undefined, then it defaults to the length of the iterable and all
 * possible full-length permutations are generated.
 *
 * The permutation tuples are emitted in lexicographic ordering according to the
 * order of the input iterable. So, if the input iterable is sorted, the
 * combination tuples will be produced in sorted order.
 *
 * Elements are treated as unique based on their position, not on their value.
 * So if the input elements are unique, there will be no repeat values in each
 * permutation.
 */
export function* permutations<T, N extends number = number>(
  iterable: Iterable<T>,
  r?: N
): Generator<Tuple<T, N>> {
  const saved = [...iterable]
  const n = saved.length
  if (r === undefined) {
    r = n as N
  }

  if (r > n) {
    return
  }

  const indicies = [...range(n)]
  const cycles = [...range(n, n - r, -1)]

  let found = n > 0
  while (found) {
    found = false
    yield indicies.slice(0, r).map((i) => saved[i]) as Tuple<T, N>

    for (const i of range(r - 1, -1, -1)) {
      cycles[i] -= 1
      if (cycles[i] == 0) {
        const temp = indicies[i]
        for (const j of range(i + 1, indicies.length)) {
          indicies[j - 1] = indicies[j]
        }
        indicies[indicies.length - 1] = temp
        cycles[i] = n - i
      } else {
        const j = cycles[i]
        const temp = indicies[i]
        indicies[i] = indicies[indicies.length - j]
        indicies[indicies.length - j] = temp

        found = true
        break
      }
    }
  }
}

/**
 * An iterator over the cartesian product of the input iterables.
 */
export function* product<T extends unknown[]>(
  ...toProduct: Iterableify<T>
): Generator<T> {
  const saved = toProduct.map((iterable) => [...iterable]) as {
    [P in keyof T]: T[P][]
  }
  // If any incuded iterator has length zero, the product is empty
  if (any(saved, (iter) => iter.length == 0)) {
    return
  }
  const n = saved.length

  /** The current indicies into each saved iterator. */
  const indicies = Array(saved.length).fill(0)

  let found = n > 0
  while (found) {
    yield [...zip(indicies, saved)].map(([idx, iter]) => iter[idx]) as T
    found = false
    for (const i of range(n - 1, -1, -1)) {
      indicies[i] = (indicies[i] + 1) % saved[i].length
      if (indicies[i] !== 0) {
        found = true
        break
      }
    }
  }
}

/**
 * Iterates over the values 0 <= i < end.
 */
export function range(end: number): Generator<number>
/**
 * Returns an iterator producing all the numbers in the given range one by one,
 * starting from `start` in increments of `step` (defaults to 1) until `end` is
 * reached.
 *
 * When the step value is positive, the iterator will keep producing values as
 * long as they are less than the end value.
 *
 * When the step value is negative, the iterator will keep producing values as
 * long as they are greater than the end value.
 *
 * If the step value is 0, it will throw a `TypeError`.
 *
 * The range will be empty if the first value to produce already does not meet
 * the value constraint.
 *
 * @example
 * ```ts
 * [...range(0, 3)] // [0, 1, 2]
 * [...range(1, 4)] // [1, 2, 3]
 * [...range(4, 0, -1)] // [4, 3, 2, 1]
 * ```
 */
export function range(
  start: number,
  end: number,
  step?: number
): Generator<number>
export function* range(
  startOrEnd: number,
  maybeEnd?: number,
  step = 1
): Generator<number> {
  if (step === 0) {
    throw new TypeError('The step argument must not be zero.')
  }

  let start: number, end: number
  if (maybeEnd === undefined) {
    end = startOrEnd
    start = 0
  } else {
    start = startOrEnd
    end = maybeEnd
  }

  if (start % 1 !== 0 || end % 1 !== 0 || step % 1 !== 0) {
    throw new TypeError('The range arguments must be integers.')
  }

  let predicate: (v: number) => boolean

  if (step > 0) {
    predicate = (v) => v < end
  } else {
    predicate = (v) => v > end
  }

  yield* takeWhile(count(start, step), predicate)
}

/**
 * Accumulates an iterator into a single value with a reducer function.
 *
 * DISCLAIMER: it may be tempting to do the following:
 *
 * ```js
 * reduce(stringIterator, (n, s) => n + s, '') // concatenate all strings
 * ```
 *
 * to concatenate a list of strings, however since strings are immutable in
 * javascript, it is better to use the Array.prototype.join() function to avoid
 * unnecessary copying of strings.
 *
 * @example
 * ```ts
 * reduce(['bing', 'bang', 'bong'], (n, s) => n + s.length, 0) // 12
 * ```
 */
export function reduce<T, R>(
  iterable: Iterable<T>,
  reducer: (accumulated: R, nextVal: T) => R,
  initialValue: R
): R {
  let accumulated = initialValue

  for (const item of iterable) {
    accumulated = reducer(accumulated, item)
  }

  return accumulated
}

/**
 * Same as reduce, but uses the first value from the iterable as the initial
 * value.
 *
 * @see [[reduce]]
 *
 * @example
 * ```ts
 * reduce_([1,2,3], (a, b) => a + b) // 6
 * ```
 */
export function reduce_<T>(
  iterable: Iterable<T>,
  reducer: (accumulated: T, nextVal: T) => T
): T | undefined {
  const iterator = iterable[Symbol.iterator]()
  const { done, value: initialValue } = iterator.next()
  if (done) {
    return undefined
  }
  return reduce(_tailIterable(iterator), reducer, initialValue)
}

/**
 * An iterator that returns a target value over and over again. Runs
 * indefinitely unless the times argument is specified.
 *
 * Used as argument to map() for invariant parameters to the called function.
 * Also used with zip() to create an invariant part of a tuple record.
 *
 * @example
 * ```ts
 * repeat(5, 3) // 5 5 5
 * map(Math.pow, [1, 2, 3, 4, 5], repeat(2)) // 1 4 9 16 25
 * zip(repeat(1), [1, 2, 3]) // [1, 1] [1, 2] [1, 3]
 * ```
 *
 * @param value The value to yield
 * @param times The number of times to yield the value. Defaults to Infinity.
 */
export function* repeat<T>(value: T, times = Infinity): Generator<T> {
  for (; times > 0; times--) {
    yield value
  }
}

/**
 * Iterates over the values of an iterator while they satisfy a predicate.
 *
 * Defaults to the truthiness of values as the predicate.
 */
export function* takeWhile<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean = Boolean
): Generator<T> {
  for (const item of iterable) {
    if (!predicate(item)) {
      break
    }
    yield item
  }
}

/**
 * Iterates over multiple iterators in parallel. Stops as soon as any of the
 * included iterators stop.
 *
 * @see [[zipLongest]]
 *
 * @example
 * ```ts
 * [...zip('Hello', [3, 2, 1])] // [['H', 3], ['e', 2], ['l', 1]]
 * ```
 */
export function* zip<T extends unknown[]>(
  ...toZip: Iterableify<T>
): Generator<T> {
  const iterators = toZip.map((i) => i[Symbol.iterator]())

  while (true) {
    const result = iterators.map((i) => i.next())
    if (result.some(({ done }) => done)) {
      break
    }
    yield result.map(({ value }) => value) as T
  }
}

/**
 * Iterates over multiple iterators in parallel. Stops when all included
 * iterators stop. Yields `undefined` for iterators that stop early.
 *
 * @see [[zip]]
 *
 * @example
 * ```ts
 * [...zipLongest('Hat', [3])] // [['H', 3], ['a', undefined], ['t', undefined]]
 * ```
 */
export function* zipLongest<T extends unknown[]>(
  ...toZip: Iterableify<T>
): Generator<Partial<T>> {
  const iterators = toZip.map((i) => i[Symbol.iterator]())

  while (true) {
    const result = iterators.map((i) => i.next())
    if (!result.some(({ done }) => !done)) {
      // All iterators are done.
      break
    }
    yield result.map(({ done, value }) =>
      done ? undefined : value
    ) as Partial<T>
  }
}
