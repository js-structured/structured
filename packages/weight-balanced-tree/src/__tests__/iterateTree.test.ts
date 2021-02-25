import { map } from '@structured/iterable'
import { Comparator, fromSorted, iterateTree } from '..'

describe('iterate tree', () => {
  const compare: Comparator<number> = (a, b) => a - b
  const keys = [0, 1, 2, 3, 4, 5, 6, 100, 1000].sort(compare)
  const root = fromSorted(keys.map((v) => [v, {}]))

  it('Should iterate all of the keys in order', () => {
    expect([...map(([k]) => k, iterateTree(root))]).toMatchObject(
      [...keys].sort(compare)
    )
  })
})
