// The lerna packages have no types. We will make do with the implicit any for
// now.
// @ts-ignore
import { getPackages } from '@lerna/project'
// @ts-ignore
import filterPackages from '@lerna/filter-packages'
// @ts-ignore
import batchPackages from '@lerna/batch-packages'

/**
 * Yields orders the packages such that dependencies come before the modules
 * that depend on them.
 *
 * @param include Packages to include. Defaults to all.
 * @param exclude Packages to exclude. Defaults to none.
 */
export async function getSortedPackages(include: string, exclude: string) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, include, exclude, true)

  return (batchPackages(filtered) as unknown[]).flat()
}

