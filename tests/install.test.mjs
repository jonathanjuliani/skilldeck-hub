import assert from 'node:assert/strict'
import test from 'node:test'

import { install, manualLines } from '../cli/install.mjs'

function fake(script) {
  const calls = []
  const logs = []
  const errors = []
  const run = (cmd, args) => {
    const key = [cmd, ...args].join(' ')
    calls.push(key)
    const step = script[key]
    if (!step) throw new Error(`unexpected ${key}`)
    if (step.throw) throw step.throw
    return { status: step.status ?? 0, stdout: step.stdout ?? '', stderr: step.stderr ?? '' }
  }
  return { calls, logs, errors, run, log: line => logs.push(line), error: line => errors.push(line) }
}

const emptyMarkets = { stdout: '[]' }
const emptyPlugins = { stdout: '[]' }
const noWebApp = { status: 1, stdout: '{"name":"lib"}' }
const webApp = { stdout: '{"name":"lib","dependencies":{"@jonathanjuliani/skillverse":{"version":"0.2.0"}}}' }
const marketAdd = 'claude plugin marketplace add jonathanjuliani/skilldeck --scope user'
const marketList = 'claude plugin marketplace list --json'
const pluginList = 'claude plugin list --json'

test('install skills adds the marketplace and the plugin', () => {
  const io = fake({
    [marketList]: emptyMarkets,
    [marketAdd]: { stdout: 'added' },
    [pluginList]: emptyPlugins,
    'claude plugin install skills@skilldeck --scope user --yes': { stdout: 'installed' },
  })
  assert.equal(install('skills', io), 0)
  assert.deepEqual(io.calls, [
    marketList,
    marketAdd,
    pluginList,
    'claude plugin install skills@skilldeck --scope user --yes',
  ])
  assert.match(io.logs[0], /Installed skills@skilldeck/)
})

test('install skills skips when skills@skilldeck is already installed', () => {
  const io = fake({
    [marketList]: { stdout: '[{"name":"skilldeck"}]' },
    [pluginList]: { stdout: '[{"id":"skills@skilldeck","enabled":true}]' },
  })
  assert.equal(install('skills', { ...io, pluginDirs: [] }), 0)
  assert.match(io.logs[0], /already installed as skills@skilldeck/)
})

test('install skillverse installs the plugin and the web app', () => {
  const io = fake({
    [marketList]: emptyMarkets,
    [marketAdd]: {},
    [pluginList]: emptyPlugins,
    'claude plugin install skillverse@skilldeck --scope user --yes': {},
    'npm list -g @jonathanjuliani/skillverse --depth=0 --json': noWebApp,
    'npm install -g @jonathanjuliani/skillverse': {},
  })
  assert.equal(install('skillverse', { ...io, pluginDirs: [] }), 0)
  assert.match(io.logs.join('\n'), /Installed skillverse@skilldeck/)
  assert.match(io.logs.join('\n'), /Installed @jonathanjuliani\/skillverse/)
})

test('install skillverse keeps an existing plugin and skips an installed web app', () => {
  const io = fake({
    [marketList]: { stdout: '[{"name":"skilldeck"}]' },
    [pluginList]: { stdout: '[{"id":"skillverse@skillverse","enabled":true}]' },
    'npm list -g @jonathanjuliani/skillverse --depth=0 --json': webApp,
  })
  assert.equal(install('skillverse', { ...io, pluginDirs: [] }), 0)
  assert.match(io.logs[0], /already installed as skillverse@skillverse/)
  assert.match(io.logs[1], /already installed/)
  assert.equal(io.calls.some(call => call.startsWith('npm install')), false)
  assert.equal(io.calls.some(call => call.startsWith('claude plugin install')), false)
})

test('install skillverse refuses a plugin-dir copy and still installs the web app', () => {
  const io = fake({
    [marketList]: { stdout: '[{"name":"skilldeck"}]' },
    [pluginList]: emptyPlugins,
    'npm list -g @jonathanjuliani/skillverse --depth=0 --json': noWebApp,
    'npm install -g @jonathanjuliani/skillverse': {},
  })
  const code = install('skillverse', {
    ...io,
    pluginDirs: ['/tmp/skillverse'],
    pluginName: dir => (dir.endsWith('skillverse') ? 'skillverse' : null),
  })
  assert.equal(code, 0)
  assert.match(io.logs[0], /already installed from \/tmp\/skillverse/)
  assert.equal(io.calls.some(call => call.startsWith('claude plugin install')), false)
  assert.equal(io.calls.some(call => call.startsWith('npm install')), true)
})

test('a missing claude prints the marketplace lines and does not install the web app', () => {
  const missing = new Error('spawn claude ENOENT')
  missing.code = 'ENOENT'
  const io = fake({
    [marketList]: { throw: missing },
  })
  assert.equal(install('skillverse', io), 1)
  assert.equal(io.errors[0], manualLines('skillverse'))
  assert.equal(io.calls.some(call => call.startsWith('npm')), false)
})

test('a failed plugin install does not install the web app', () => {
  const io = fake({
    [marketList]: { stdout: '[{"name":"skilldeck"}]' },
    [pluginList]: emptyPlugins,
    'claude plugin install skillverse@skilldeck --scope user --yes': { status: 1, stderr: 'refused' },
  })
  assert.equal(install('skillverse', { ...io, pluginDirs: [] }), 1)
  assert.match(io.errors[0], /refused/)
  assert.equal(io.calls.some(call => call.startsWith('npm')), false)
})
