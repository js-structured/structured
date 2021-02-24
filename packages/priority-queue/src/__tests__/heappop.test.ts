import { Comparator, heappop } from '..'
import '../../setupTests'

describe('heappop', () => {
  // The example heap obeys the heap substructure according to the example
  // compare function.
  const exampleHeap = [2, 8, 10, 433, 23111, 23, 31]
  const exampleCompare: Comparator<number> = (a, b) => a - b

  it('Should remove the min element from a heap', () => {
    const heap = [...exampleHeap]
    const originalLength = heap.length
    const compare = exampleCompare

    expect(heappop(heap, compare)).toBe(2)
    expect(heap.length).toBe(originalLength - 1)
  })

  it('Should maintain the heap invariant', () => {
    const heap = [...exampleHeap]
    const compare = exampleCompare

    heappop(heap, compare)
    expect(heap).toObeyHeapInvariant(compare)
  })
})
