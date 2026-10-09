# Install

What `skilldeck install` does, and what it refuses to do twice.
Open this when a command skipped a plugin, or `claude` is not on PATH.
Back to [skilldeck](../README.md).

Both routes install the same plugins. The npm command adds the marketplace `jonathanjuliani/skilldeck` at user scope when it is missing, then installs the plugin.

## skills

`skilldeck install skills` installs `skills@skilldeck` when that plugin is not already installed.

If it is already installed, the command stops and says so. A second copy would load every skill twice.

After it installs, start a new Claude Code session. Setup is `/skilldeck:setup-skills`. It asks before writing `.skilldeck-skills/config.yaml`.

## skillverse

`skilldeck install skillverse` installs `skillverse@skilldeck` when none of these is already present:

1. `skillverse@skilldeck`
2. `skillverse@skillverse`
3. a plugin folder whose name is `skillverse`, from `CLAUDE_CODE_PLUGIN_DIRS` or `~/.claude/settings.json`

If one is already present, it says so and does not install a second copy. A second copy would show two Skillverse buttons.

It also installs `@jonathanjuliani/skillverse` when that package is missing globally. It does not start the server. Start it with `skillverse run`. If the package is already installed, it says so and prints that same command.

## When claude is not on PATH

The command prints the lines to run inside Claude Code.

For skills:

```text
/plugin marketplace add jonathanjuliani/skilldeck
/plugin install skills@skilldeck
```

For Skillverse it prints those lines with `skillverse@skilldeck`, then:

```bash
npm install -g @jonathanjuliani/skillverse
```

## Other agents

Codex uses this same marketplace:

```bash
codex plugin marketplace add jonathanjuliani/skilldeck
codex plugin add skills@skilldeck
```

The npm command is Claude Code. It calls the `claude` CLI.

Cursor and Gemini keep their own install paths in the [skills repo](https://github.com/jonathanjuliani/skills).

## It's working if

- Skills shows once, as `skills@skilldeck`.
- Skillverse shows one button, not two.
- The web app is installed, and you still start it yourself with `skillverse run`.
