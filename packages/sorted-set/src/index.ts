import {
  insert,
  findByKey,
  WBTNode,
  remove,
  iterateTree,
  iterateTreeKeys,
  union,
  intersection,
  fromSorted,
} from '@structured/weight-balanced-tree'
import { Comparator } from '@structured/comparable'

// The validity of the implementation comes from
// '@structured/weight-balanced-tree'. I have decided to avoid implementing unit
// tests for this module, as it is no more than a wrapper.

export default class SortedSet<T> implements Set<T> {
  private root: WBTNode<T, T> | undefined
  private compare: Comparator<T>

  constructor(compare: Comparator<T>) {
    this.compare = compare
  }

  add(value: T): this {
    if (!this.has(value)) {
      this.root = insert(this.root, value, value, this.compare)
    }
    return this
  }

  clear(): void {
    this.root = undefined
  }

  delete(value: T): boolean {
    const newRoot = remove(this.root, value, this.compare)
    if (newRoot === this.root) {
      // No value was deleted.
      return false
    }
    this.root = newRoot
    return true
  }

  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    thisArg?: any
  ): void {
    callbackfn = callbackfn.bind(thisArg)
    for (const [k, v] of iterateTree(this.root)) {
      callbackfn(k, v, this)
    }
  }

  has(value: T): boolean {
    return findByKey(this.root, value, this.compare) !== undefined
  }

  get size(): number {
    return this.root?.weight ?? 0
  }

  [Symbol.iterator](): IterableIterator<T> {
    return iterateTreeKeys(this.root)
  }

  entries(): IterableIterator<[T, T]> {
    return iterateTree(this.root)
  }

  keys(): IterableIterator<T> {
    return iterateTreeKeys(this.root)
  }

  values(): IterableIterator<T> {
    return iterateTreeKeys(this.root)
  }

  [Symbol.toStringTag]: 'SortedSet'

  static union<T>(
    compare: Comparator<T>,
    ...sets: SortedSet<T>[]
  ): SortedSet<T> {
    const result = new SortedSet<T>(compare)

    result.root = union(compare, ...sets.map((s) => s.root))

    return result
  }

  static intersection<T>(
    compare: Comparator<T>,
    ...sets: SortedSet<T>[]
  ): SortedSet<T> {
    const result = new SortedSet<T>(compare)

    result.root = intersection(compare, ...sets.map((s) => s.root))

    return result
  }

  static from<T>(compare: Comparator<T>, iterable: Iterable<T>): SortedSet<T> {
    const sorted = [...iterable]
      .sort(compare)
      .filter((v, i, arr) => i === 0 || compare(arr[i - 1], v) < 0)
    const result = new SortedSet<T>(compare)

    result.root = fromSorted(sorted.map((v) => [v, v]))

    return result
  }
}
