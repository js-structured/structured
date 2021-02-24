import { singleLeft, singleRight, RotateCallback } from '..'
import { rightHeavy, leftHeavy } from './tree-rotation.test'

describe('rotation callbacks', () => {
  const onRotate: RotateCallback<{ weight: number }> = (...a) => [...a]

  describe.each([
    ['onLeft', singleLeft, rightHeavy, leftHeavy],
    ['onRight', singleRight, leftHeavy, rightHeavy],
  ])('%s', (_name, rotator, willRotate, willNotRotate) => {
    it('Should be called once if the node is rotated', () => {
      const mocked = jest.fn(onRotate)
      rotator(willRotate, mocked)

      expect(mocked).toHaveBeenCalledTimes(1)
    })

    it('Should not be called if the node is not rotated', () => {
      const mocked = jest.fn(onRotate)
      rotator(willNotRotate, mocked)

      expect(mocked).not.toHaveBeenCalled()
    })

    it('Should call each of the callbacks once', () => {
      const mocked = jest.fn(onRotate)
      const repeats = 5
      rotator(willRotate, Array(repeats).fill(mocked))

      expect(mocked).toHaveBeenCalledTimes(repeats)
    })
  })
})
