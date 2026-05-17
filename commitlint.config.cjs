/**
 * Conventional Commits — https://www.conventionalcommits.org/
 *
 * Allowed types are intentionally aligned with the modules in CLAUDE.md so that
 * scopes can reference modules, e.g. `feat(validation): add rule engine`.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "body-max-line-length": [0, "always"],
  },
};
