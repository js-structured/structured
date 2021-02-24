import { Comparator, heappushpop } from '..'
import '../../setupTests'

describe('heappushpop', () => {
  const exampleHeap = [2, 8, 10, 433, 23111, 23, 31]
  const exampleCompare: Comparator<number> = (a, b) => a - b

  it('Should pop the current minimum if the replacement is larger', () => {
    const heap = [...exampleHeap]
    const compare = exampleCompare
    const min = Math.min(...heap)
    // The value is larger than the minimum.
    const value = min + 1

    expect(heappushpop(heap, value, compare)).toBe(min)
  })

  it('Should pop the replacement value if it is less than the minimum', () => {
    const heap = [...exampleHeap]
    const compare = exampleCompare
    const min = Math.min(...heap)
    // The value is less than the minimum.
    const value = min - 1

    expect(heappushpop(heap, value, compare)).toBe(value)
  })

  it('Should preserve the heap invariant', () => {
    const heap = [...exampleHeap]
    const compare = exampleCompare

    heappushpop(heap, heap[0] + 1, compare)

    expect(heap).toObeyHeapInvariant(compare)
  })
})
