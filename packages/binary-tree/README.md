# `@structured/binary-tree`

A simple binary tree and so much more.

## Installation

```
yarn add @structured/binary-tree
```

## Usage

```javascript
import { singleLeft } from '@structured/binary-tree';

let root = {
  data: 'a',
  right: {
    data: 'b',
    right: {
      data: 'c',
    },
  },
}

// Balance the tree with a left rotation!
root = singleLeft(root)
// {
//   data: 'b',
//   left: { data: 'a' },
//   right: { data: 'c' },
// }
```