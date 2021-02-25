const { getPackagesSync } = require('@lerna/project')
const path = require('path')

module.exports = {
  name: '@structured',
  out: 'docs',
  theme: 'default',
  exclude: '*.spec.ts',
  'external-modulemap': '.*packages/([^/]+)/.*',
  entryPoints: getPackagesSync(path.join(__dirname, 'packages')).map(
    pkg => path.join(
      path.relative(__dirname, pkg.location), 'src/index.ts'
    )
  ),
  excludeExternals: false
}
