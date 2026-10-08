#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

import { install } from '../cli/install.mjs'

const HELP = `skilldeck installs Claude Code plugins from the skilldeck marketplace.

Usage:
  skilldeck install skills       install skills@skilldeck when no skills plugin is already installed
  skilldeck install skillverse   install skillverse@skilldeck when needed, and the web app
  skilldeck --version
  skilldeck --help

In Claude Code, the same marketplace is:
  /plugin marketplace add jonathanjuliani/skilldeck
  /plugin install skills@skilldeck
  /plugin install skillverse@skilldeck`

function version() {
  return JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: 'utf8' })
  if (result.error) throw result.error
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

const argv = process.argv.slice(2)
const [command, target] = argv

if (argv.includes('--help') || argv.includes('-h') || command === 'help') {
  console.log(HELP)
} else if (argv.includes('--version') || argv.includes('-v')) {
  console.log(version())
} else if (command === 'install' && (target === 'skills' || target === 'skillverse')) {
  process.exitCode = install(target, { run })
} else {
  console.error(command ? `Unknown command: ${argv.join(' ')}\n\n${HELP}` : HELP)
  process.exitCode = command ? 2 : 0
}
