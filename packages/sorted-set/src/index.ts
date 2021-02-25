import {
  insert,
  findByIndex,
  findByKey,
  WBTNode,
  remove,
  iterateTree,
  iterateTreeKeys,
} from '@structured/weight-balanced-tree'
import { Comparator } from '@structured/comparable'

class SortedSet<T> implements Set<T> {
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
}
