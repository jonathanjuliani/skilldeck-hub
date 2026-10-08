# skilldeck

One Claude Code marketplace for the skills pack and Skillverse, and a command that runs those installs.

Pick one route per plugin. Installing the same plugin twice loads it twice: every skill twice, or two Skillverse buttons.

## Marketplace

```
/plugin marketplace add jonathanjuliani/skilldeck
/plugin install skills@skilldeck
/plugin install skillverse@skilldeck
```

`skills@skilldeck` is the pack in [jonathanjuliani/skills](https://github.com/jonathanjuliani/skills). Slash commands stay `/jon:…`, and setup is `/jon:setup-skills`. It is the same pack as `jon@skills`.

`skillverse@skilldeck` is the plugin in [jonathanjuliani/skillverse](https://github.com/jonathanjuliani/skillverse). It is the same plugin as `skillverse@skillverse`. The web app is a separate install.

Start a new Claude Code session after installing.

## npm

```bash
npm i -g @jonathanjuliani/skilldeck
skilldeck install skills
skilldeck install skillverse
```

`skilldeck install skills` adds the marketplace if it is missing, then installs `skills@skilldeck` when no skills plugin is already installed (`skills@skilldeck` or `jon@skills`).

`skilldeck install skillverse` adds the marketplace if it is missing, then installs `skillverse@skilldeck` when no Skillverse plugin is already installed (`skillverse@skilldeck`, `skillverse@skillverse`, or a plugin folder). It also installs `@jonathanjuliani/skillverse` when the web app is missing. It does not start the server. Start it with `skillverse run`.

If `claude` is not on `PATH`, the command prints the `/plugin` lines to run instead.

Cursor, Codex, and Gemini keep their own install paths in the skills repo. This marketplace is Claude Code.
