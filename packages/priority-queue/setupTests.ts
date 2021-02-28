import { Comparator } from '@structured/comparable'

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Checks whether or not the values obey the heap invariant according to
       * the passed compare function.
       */
      toObeyHeapInvariant<T>(compare: Comparator<T>): R
    }
  }
}

expect.extend({
  toObeyHeapInvariant<T>(
    recieved: T[],
    compare: Comparator<T>
  ): jest.CustomMatcherResult {
    for (let i = 0; i < recieved.length; i++) {
      const left = 2 * i + 1
      const right = 2 * i + 2

      if (
        (left < recieved.length && compare(recieved[i], recieved[left]) > 0) ||
        (right < recieved.length && compare(recieved[i], recieved[right]) > 0)
      ) {
        return {
          pass: false,
          message: () => `Expected ${recieved} to obey the heap invariant.`,
        }
      }
    }

    return {
      pass: true,
      message: () => `Expected ${recieved} to not obey the heap invariant.`,
    }
  },
})
