const path = require('path')

/** @type {import('bili').Config} */
module.exports = {
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    dir: 'lib'
  },
  plugins: {
    'typescript2': {
      cacheRoot: path.join(__dirname, '.rpt2_cache'),
    }
  }
}