import { merge } from '..'

describe('merge', () => {
  const a = [1, 3, 5, 7, 9]
  const b = [2, 4, 4.5, 6, 8]
  const c = []

  const concatenated = a.concat(b).concat(c)
  const merged = [...merge<number>((a, b) => a - b, a, b, c)]

  it('Should iterate all values in order', () => {
    expect([...concatenated].sort()).toMatchObject(merged)
  })
})
