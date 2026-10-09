import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const MARKETPLACE = 'jonathanjuliani/skilldeck'
export const MARKETPLACE_NAME = 'skilldeck'
export const WEB_APP = '@jonathanjuliani/skillverse'

const SKILLS_IDS = ['skills@skilldeck']
const SKILLVERSE_IDS = ['skillverse@skilldeck', 'skillverse@skillverse']

const PLUGIN_INSTALL = ['plugin', 'install']
const PLUGIN_LIST = ['plugin', 'list', '--json']
const MARKET_LIST = ['plugin', 'marketplace', 'list', '--json']
const MARKET_ADD = ['plugin', 'marketplace', 'add', MARKETPLACE, '--scope', 'user']

export function manualLines(target) {
  const lines = [
    'claude is not on PATH. Run these in Claude Code:',
    `/plugin marketplace add ${MARKETPLACE}`,
    `/plugin install ${target}@${MARKETPLACE_NAME}`,
  ]
  if (target === 'skillverse') {
    lines.push('', 'And install the web app:', `npm install -g ${WEB_APP}`)
  }
  return lines.join('\n')
}

export function splitDirs(value) {
  if (!value) return []
  return value
    .split(path.delimiter)
    .map(dir => dir.trim())
    .filter(Boolean)
}

export function readPluginDirs() {
  const fromEnv = splitDirs(process.env.CLAUDE_CODE_PLUGIN_DIRS)
  let fromSettings = []
  try {
    const file = path.join(os.homedir(), '.claude', 'settings.json')
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'))
    fromSettings = splitDirs(settings.env?.CLAUDE_CODE_PLUGIN_DIRS)
  } catch {
    fromSettings = []
  }
  return [...new Set([...fromEnv, ...fromSettings])]
}

export function readPluginName(dir) {
  for (const rel of ['.claude-plugin/plugin.json', 'plugin.json']) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'))
      if (typeof manifest.name === 'string' && manifest.name) return manifest.name
    } catch {
      // This path is not a plugin root.
    }
  }
  return null
}

function parseJson(stdout, label) {
  const start = stdout.search(/[[{]/)
  const body = start === -1 ? stdout : stdout.slice(start)
  try {
    return JSON.parse(body)
  } catch {
    throw new Error(`${label} did not return JSON`)
  }
}

function output(result) {
  const text = `${result.stderr || ''}\n${result.stdout || ''}`.trim()
  return text || 'The command failed.'
}

function installed(plugins, ids) {
  return plugins.find(plugin => ids.includes(plugin.id)) ?? null
}

function webAppPresent(listed) {
  return Boolean(listed.dependencies?.[WEB_APP])
}

function pluginDirCopy(dirs, pluginName, name) {
  return dirs.find(dir => pluginName(dir) === name) ?? null
}

function ensureMarketplace(run) {
  const listed = run('claude', MARKET_LIST)
  if (listed.status !== 0) throw new Error(output(listed))
  const markets = parseJson(listed.stdout, 'claude plugin marketplace list')
  if (markets.some(market => market.name === MARKETPLACE_NAME)) return
  const added = run('claude', MARKET_ADD)
  if (added.status !== 0) throw new Error(output(added))
}

function listPlugins(run) {
  const listed = run('claude', PLUGIN_LIST)
  if (listed.status !== 0) throw new Error(output(listed))
  return parseJson(listed.stdout, 'claude plugin list')
}

function installPlugin(run, id) {
  const installedPlugin = run('claude', [...PLUGIN_INSTALL, id, '--scope', 'user', '--yes'])
  if (installedPlugin.status !== 0) throw new Error(output(installedPlugin))
}

function ensureWebApp(run, log) {
  const listed = run('npm', ['list', '-g', WEB_APP, '--depth=0', '--json'])
  let present = false
  try {
    present = webAppPresent(parseJson(listed.stdout, 'npm list'))
  } catch (error) {
    if (listed.status !== 0) throw new Error(output(listed))
    throw error
  }
  if (present) {
    log(`${WEB_APP} is already installed. Start it with: skillverse run`)
    return
  }
  const added = run('npm', ['install', '-g', WEB_APP])
  if (added.status !== 0) throw new Error(output(added))
  log(`Installed ${WEB_APP}. Start it with: skillverse run`)
}

function failMissingClaude(target, error, command) {
  if (error?.code === 'ENOENT' && (!command || command === 'claude')) {
    const missing = new Error(manualLines(target))
    missing.code = 'ENOENT'
    return missing
  }
  return error
}

/**
 * Install one skilldeck target. Returns a process exit code.
 * @param {'skills' | 'skillverse'} target
 */
export function install(target, options) {
  const log = options.log ?? console.log
  const errorLog = options.error ?? console.error
  const run = (cmd, args) => {
    try {
      return options.run(cmd, args)
    } catch (error) {
      throw failMissingClaude(target, error, cmd)
    }
  }
  const pluginDirs = options.pluginDirs ?? readPluginDirs()
  const pluginName = options.pluginName ?? readPluginName

  try {
    ensureMarketplace(run)
    const plugins = listPlugins(run)

    if (target === 'skills') {
      const existing = installed(plugins, SKILLS_IDS)
      if (existing) {
        log(`skills is already installed as ${existing.id}. A second install would load every skill twice.`)
        return 0
      }
      installPlugin(run, 'skills@skilldeck')
      log('Installed skills@skilldeck. Start a new Claude Code session. Setup is /jon:setup-skills.')
      return 0
    }

    const existing = installed(plugins, SKILLVERSE_IDS)
    const fromDir = existing ? null : pluginDirCopy(pluginDirs, pluginName, 'skillverse')
    if (existing) {
      log(`Skillverse is already installed as ${existing.id}. A second copy would show two buttons.`)
    } else if (fromDir) {
      log(`Skillverse is already installed from ${fromDir}. A second copy would show two buttons.`)
    } else {
      installPlugin(run, 'skillverse@skilldeck')
      log('Installed skillverse@skilldeck. Start a new Claude Code session.')
    }
    ensureWebApp(run, log)
    return 0
  } catch (error) {
    errorLog(error.message)
    return 1
  }
}
