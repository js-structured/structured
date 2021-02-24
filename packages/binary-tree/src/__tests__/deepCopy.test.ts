import { deepCopy } from '..'

const root = {
  left: {
    left: { value: 'a' },
    value: 'b',
    right: { value: 'c' },
  },
  value: 'd',
  right: {
    left: { value: 'e' },
    value: 'f',
    right: { value: 'g' },
  },
}

describe('deep copy', () => {
  const copy = deepCopy(root)

  it('Should not return the original node', () => {
    expect(root).not.toBe(copy)
  })

  it('Should match the original tree', () => {
    // The reason we do both is because we want to make sure there are no new
    // keys on either object that are undefined.

    // expect({}).toMatchObject({ a: undefined }) // fails, but
    // expect({ a: undefined }).toMatchObject({}) // passes

    expect(root).toMatchObject(copy)
    expect(copy).toMatchObject(root)
  })
})
