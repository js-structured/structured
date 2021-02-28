import { compareWith } from '..'
import { Comparator } from '@structured/comparable'
import '../../setupTests'

describe('useHeap', () => {
  const exampleCompare: Comparator<number> = (a, b) => a - b
  const exampleValues = [8, 2, 10, 433, 23111, 23, 31]
  const exampleHeap = [2, 8, 10, 433, 23111, 23, 31]
  const { heapify, heappop, heappush, heappushpop, heapreplace } = compareWith(
    exampleCompare
  )

  describe('heapify', () => {
    it('Should heapify an array to abide by the original compare function', () => {
      const values = [...exampleValues]

      heapify(values)

      expect(values).toObeyHeapInvariant(exampleCompare)
    })
  })

  describe('heappop', () => {
    it('Should retain the heap invaraiant after a pop, according to the original compare function', () => {
      const heap = [...exampleHeap]

      expect(heappop(heap)).toBe(Math.min(...exampleHeap))
      expect(heap).toObeyHeapInvariant(exampleCompare)
    })
  })

  describe('heappush', () => {
    it('Should retain the heap invaraiant after a push, according to the original compare function', () => {
      const heap = [...exampleHeap]
      const value = Math.min(...exampleHeap)

      heappush(heap, value)
      expect(heap).toObeyHeapInvariant(exampleCompare)
    })
  })

  describe('heappushpop', () => {
    it('Should retain the heap invariant after a push-pop, according to the original compare function', () => {
      const heap = [...exampleHeap]
      const min = Math.min(...exampleHeap)
      const value = min - 1

      expect(heappushpop(heap, value)).toBe(value)
      expect(heap).toObeyHeapInvariant(exampleCompare)
    })
  })

  describe('heapreplace', () => {
    it('Should retain the heap invariant after a replace, according to the original compare function', () => {
      const heap = [...exampleHeap]
      const min = Math.min(...exampleHeap)
      const value = min - 1

      expect(heapreplace(heap, value)).toBe(min)
      expect(heap).toObeyHeapInvariant(exampleCompare)
    })
  })
})
