// @ts-nocheck
import { promises as fs } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

interface VersionInfo {
  version: string
  tag: string
  commit: string
  builtAt: string
}

async function ensureDirectoryExists(targetDir: string): Promise<void> {
  try {
    await fs.mkdir(targetDir, { recursive: true })
  } catch {}
}

async function readPackageVersion(packageJsonPath: string): Promise<string> {
  const raw = await fs.readFile(packageJsonPath, 'utf8')
  const pkg = JSON.parse(raw) as { version: string }
  if (!pkg.version || typeof pkg.version !== 'string') {
    throw new Error('package.json does not contain a valid version field')
  }
  return pkg.version
}

function getGitCommitShortSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'unknown'
  }
}

async function writeVersionFile(outputPath: string, info: VersionInfo): Promise<void> {
  const json = JSON.stringify(info, null, 2)
  await fs.writeFile(outputPath, json + '\n', 'utf8')
}

async function main(): Promise<void> {
  const repoRoot = process.cwd()
  const packageJsonPath = path.join(repoRoot, 'package.json')
  const publicDir = path.join(repoRoot, 'public')
  const outputPath = path.join(publicDir, 'version.json')

  const version = await readPackageVersion(packageJsonPath)
  const info: VersionInfo = {
    version,
    tag: `v${version}`,
    commit: getGitCommitShortSha(),
    builtAt: new Date().toISOString(),
  }

  await ensureDirectoryExists(publicDir)
  await writeVersionFile(outputPath, info)
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`)
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})

