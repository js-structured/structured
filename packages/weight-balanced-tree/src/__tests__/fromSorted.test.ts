import { Comparator, fromSorted, isBalanced } from '..'
import '../../setupTests'

describe('fromSorted', () => {
  const values = [0, 1, 2, 3, 4, 5, 6]
  const compare: Comparator<number> = (a, b) => a - b

  values.sort(compare)

  const root = fromSorted(values.map((v) => [v, v]))

  it('Should create a balanced tree', () => {
    expect(root).toBeBalanced(isBalanced)
  })

  it('Should have correct weights on the nodes', () => {
    expect(root).toHaveCorrectWeights()
  })

  it('Should be in order', () => {
    expect(root).toBeOrdered(compare)
  })
})
