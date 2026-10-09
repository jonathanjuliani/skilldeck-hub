#!/usr/bin/env node
// One version for skilldeck, kept in package.json and CHANGELOG.md.
//
//   node scripts/sync-version.mjs
//       Turns the CHANGELOG's Unreleased section into a dated section for
//       package.json's version. `npm version <patch|minor|major>` runs this
//       (the "version" script) before it commits and tags.
//
//   node scripts/sync-version.mjs --check [vX.Y.Z]
//       Fails when the CHANGELOG has no section for package.json's version;
//       given a tag, also when the tag differs from it. CI and the release
//       workflow run this.

import fs from 'node:fs'

const REPO = 'https://github.com/jonathanjuliani/skilldeck'
const CHANGELOG = 'CHANGELOG.md'

const fail = message => {
  console.error(`sync-version: ${message}`)
  process.exit(1)
}

const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
const [mode, tagArg] = process.argv.slice(2)
const tag = tagArg?.replace(/^refs\/tags\//, '').replace(/^v/, '')

if (mode === '--check') {
  if (tag && tag !== version) fail(`tag v${tag} but package.json says ${version}`)
  if (!fs.readFileSync(CHANGELOG, 'utf8').includes(`## [${version}]`)) {
    fail(`${CHANGELOG} has no "## [${version}]" section`)
  }
  console.log(`sync-version: ${version} in package.json and ${CHANGELOG}${tag ? ', matching the tag' : ''}`)
  process.exit(0)
}

let changelog = fs.readFileSync(CHANGELOG, 'utf8')
if (!changelog.includes(`## [${version}]`)) {
  if (!changelog.includes('## [Unreleased]')) fail(`${CHANGELOG} has no "## [Unreleased]" section to release`)
  const today = new Date().toISOString().slice(0, 10)
  // The newest released version, from the first version link, before this one is added.
  const previous = /^\[(\d+\.\d+\.\d+)\]: /m.exec(changelog)?.[1]
  changelog = changelog.replace('## [Unreleased]', `## [Unreleased]\n\n## [${version}] - ${today}`)
  changelog = changelog.replace(
    /^\[Unreleased\]: .*$/m,
    `[Unreleased]: ${REPO}/compare/v${version}...HEAD\n[${version}]: ${previous ? `${REPO}/compare/v${previous}...v${version}` : `${REPO}/releases/tag/v${version}`}`,
  )
  fs.writeFileSync(CHANGELOG, changelog)
}

console.log(`sync-version: ${version} written to ${CHANGELOG}`)
