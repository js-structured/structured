import { Comparator, heapify } from '..'
import '../../setupTests'

describe('heapify', () => {
  const exampleValues = [8, 2, 10, 433, 23111, 23, 31]
  const exampleCompare: Comparator<number> = (a, b) => a - b

  it('Should modify an array to obey the heap invariant', () => {
    const values = [...exampleValues]
    const compare = exampleCompare

    heapify(values, compare)

    expect(values).toObeyHeapInvariant(compare)
  })

  it('Should move the minimum of the array to the front', () => {
    const values = [...exampleValues]
    const compare = exampleCompare

    const min = Math.min(...values)
    heapify(values, compare)

    expect(values[0]).toBe(min)
  })
})
