# Changelog

All notable changes to skilldeck are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-10-08

### Changed

- The README is the install action. What each command skips, and the fallback when `claude` is not on PATH, live in `docs/install.md`.

## [0.1.0] - 2026-10-08

### Added

- Claude Code marketplace `skilldeck`, with `skills` from `jonathanjuliani/skills` and `skillverse` from `jonathanjuliani/skillverse`.
- `skilldeck install skills` installs `skills@skilldeck` when no skills plugin is already installed.
- `skilldeck install skillverse` installs `skillverse@skilldeck` when no Skillverse plugin is already installed, and installs the `@jonathanjuliani/skillverse` web app when it is missing.

[Unreleased]: https://github.com/jonathanjuliani/skilldeck/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/jonathanjuliani/skilldeck/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jonathanjuliani/skilldeck/releases/tag/v0.1.0
