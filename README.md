# skilldeck

One Claude Code marketplace for the skills pack and Skillverse, and a command that runs those installs.

Pick one route per plugin. Installing the same plugin twice loads it twice: every skill twice, or two Skillverse buttons.

## Do this

Pick marketplace or npm. Then install skills, Skillverse, or both.

1. Marketplace, in Claude Code:

```text
/plugin marketplace add jonathanjuliani/skilldeck
/plugin install skills@skilldeck
/plugin install skillverse@skilldeck
```

2. npm:

```bash
npm i -g @jonathanjuliani/skilldeck
skilldeck install skills
skilldeck install skillverse
```

Start a new Claude Code session after installing.

`skills@skilldeck` is the pack in [jonathanjuliani/skills](https://github.com/jonathanjuliani/skills). Slash commands are `/skilldeck:…`, and setup is `/skilldeck:setup-skills`. Codex installs the same plugin with `codex plugin marketplace add jonathanjuliani/skilldeck` and `codex plugin add skills@skilldeck`. The npm command is Claude Code.

`skillverse@skilldeck` is the plugin in [jonathanjuliani/skillverse](https://github.com/jonathanjuliani/skillverse). It is the same plugin as `skillverse@skillverse`. The web app is a separate install.

## Read next

- [Install](docs/install.md) — what each command skips, and what to run when `claude` is not on PATH
- [Develop](docs/develop.md) — how a release is cut
