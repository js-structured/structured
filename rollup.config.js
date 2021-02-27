import { getPackages } from '@lerna/project'
import { filterPackages } from '@lerna/filter-packages'
import batchPackages from '@lerna/batch-packages'
import minimist from 'minimist'
import path from 'path'
import typescript from 'rollup-plugin-typescript2'

/**
 * Yields orders the packages such that dependencies come before the modules
 * that depend on them.
 *
 * @param {string} include Glob for packages to include. Defaults to all.
 * @param {string} exclude Glob for packages to exclude. Defaults to none.
 */
async function getSortedPackages(include, exclude) {
  const packages = await getPackages(path.join(__dirname, 'packages'))
  const filtered = filterPackages(packages, include, exclude, true)

  return batchPackages(filtered).flat()
}

/**
 * Returns a list of the names of the dependencies in the dependency object.
 * 
 * @param {Record<string, string> | undefined} dependencies 
 * @returns {string[]} The dependency names as a list
 */
function getDependencyNames(dependencies) {
  return Object.keys(dependencies || {})
}

async function getConfig() {
  const config = []

  // Support --scope and --ignore globs if passed in via commandline
  const { scope, ignore } = minimist(process.argv.slice(2))

  const packages = await getSortedPackages(scope, ignore)
  packages.forEach((pkg) => {
    /* Absolute path to package directory */
    const basePath = path.relative(__dirname, pkg.location)

    /** Absolute path to the input file */
    const input = path.join(basePath, 'src/index.ts')

    /* "main" field from package.json file. */
    const { name, main, module, dependencies, peerDependencies } = pkg.toJSON()
    const output = []

    if (main) {
      output.push({
        file: path.join(basePath, main),
        format: 'cjs',
      })
    }

    if (module) {
      output.push({
        file: path.join(basePath, module),
        format: 'esm',
      })
    }

    // Push build config for this package.
    if (output.length > 0) {
      config.push({
        input,
        output,
        external: [dependencies, peerDependencies].flatMap(getDependencyNames),
        plugins: [
          typescript({
            typescript: require('typescript'),
            tsconfig: path.join(basePath, 'tsconfig.json')
          }),
        ],
      })
    } else {
      console.warn(`Package has no valid output: ${name}`)
    }
  })

  return config
}

export default async () => getConfig()
