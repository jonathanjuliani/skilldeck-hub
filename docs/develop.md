# Develop

How a release is cut.
Open this when you are publishing a new version.
Back to [skilldeck](../README.md).

## Releasing

The version lives in `package.json` and [CHANGELOG.md](../CHANGELOG.md).

1. Add each change under `## [Unreleased]` in [CHANGELOG.md](../CHANGELOG.md) as you make it.
2. On a clean `main`, run `npm version patch` (or `minor` / `major`). It bumps `package.json`, turns _Unreleased_ into a dated section, then commits and tags `vX.Y.Z`.
3. `git push --follow-tags`. The [release workflow](../.github/workflows/release.yml) checks that the tag and the changelog agree, runs the tests, publishes the npm package with provenance, and creates the GitHub Release from that version's changelog section.

`npm run check-version` checks that the changelog has a section for the package version. Publishing to npm uses the `NPM_TOKEN` secret already set in the repository's Actions secrets.

## It's working if

- `npm view @jonathanjuliani/skilldeck version` prints the tag you pushed.
