# Pre-Commit Hooks Guide

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to maintain code quality through automated pre-commit checks.

## What Happens on Commit?

When you run `git commit`, the following checks run automatically:

### 1. Lint-Staged (Fast - Staged Files Only)

Runs on **staged files only** for fast feedback:

**TypeScript Files** (`.ts`, `.tsx`):

- ✅ ESLint with auto-fix
- ✅ Prettier formatting

**Other Files** (`.js`, `.json`, `.md`, `.css`, `.html`):

- ✅ Prettier formatting

### 2. Type Checking (Full Codebase)

Validates TypeScript types across the entire project:

```bash
tsc --noEmit
```

This catches type errors that might affect other files, even if they're not staged.

### 3. Unit Tests (Full Test Suite)

Runs all 184 tests to ensure nothing is broken:

```bash
npm run test:run
```

**Coverage**:

- Formula Parser (19 tests)
- Formula Calculator (45 tests)
- Dependency Graph (25 tests)
- Spreadsheet (55 tests)
- Eval Engine (40 tests)

## Installation & Setup

Already configured! Hooks are automatically installed when you run:

```bash
npm install
```

This triggers the `prepare` script which runs `husky` to set up the hooks.

## Configuration Files

### package.json

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,css,html,md}": ["prettier --write"]
  }
}
```

### .husky/pre-commit

The main pre-commit hook script that orchestrates all checks.

## Manual Commands

Run checks manually without committing:

```bash
# Run all pre-commit checks
./.husky/pre-commit

# Run individual checks
npx lint-staged           # Lint/format staged files
npm run build             # Type check
npm run test:run          # Run tests
npm run lint              # Lint all files
npm run format            # Format all files
```

## Skipping Hooks (Use Sparingly!)

In rare cases where you need to bypass hooks:

```bash
git commit --no-verify -m "emergency fix"
# or shorthand
git commit -n -m "emergency fix"
```

**Warning**: Only skip hooks when absolutely necessary (e.g., emergency hotfixes, work-in-progress commits to a feature branch).

## Troubleshooting

### Hooks Not Running?

Check if hooks are executable:

```bash
ls -la .husky/
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

Reinstall Husky:

```bash
npm run prepare
```

### Tests Failing?

Run tests individually to debug:

```bash
npm test                  # Interactive watch mode
npm run test:run          # Run once
npm run test:ui           # Visual UI
```

### Type Errors?

Run TypeScript compiler to see detailed errors:

```bash
npx tsc --noEmit
```

### Lint Errors?

See all linting issues:

```bash
npm run lint
```

Auto-fix where possible:

```bash
npm run lint:fix
```

## Performance Tips

### Commit Frequently with Smaller Changes

Smaller commits = faster pre-commit checks!

### Use `git add -p` for Partial Staging

Stage specific changes to run lint-staged on fewer files:

```bash
git add -p src/core/eval-engine.ts
```

### Run Tests in Watch Mode During Development

Keep tests running in a separate terminal:

```bash
npm test
```

This gives immediate feedback and makes the pre-commit test run faster (tests are cached).

## What Gets Checked?

| Check      | Scope              | Speed    | Purpose                   |
| ---------- | ------------------ | -------- | ------------------------- |
| ESLint     | Staged `.ts` files | ⚡ Fast  | Code quality, catch bugs  |
| Prettier   | Staged files       | ⚡ Fast  | Consistent formatting     |
| TypeScript | Entire codebase    | 🐢 ~1-2s | Type safety               |
| Tests      | Entire test suite  | 🐢 ~1-2s | Functionality correctness |

## Benefits

✅ **Catches errors early** - Before they reach CI/CD
✅ **Consistent code style** - Automatic formatting
✅ **Type safety** - No TypeScript errors slip through
✅ **Working code** - All tests must pass
✅ **Better code reviews** - Reviewers focus on logic, not style
✅ **Faster CI/CD** - Fewer failed builds

## Updating Hooks

### Modify lint-staged Configuration

Edit the `lint-staged` section in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "your-custom-command" // Add new commands here
    ]
  }
}
```

### Modify Pre-Commit Script

Edit `.husky/pre-commit` to add/remove checks:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

npx lint-staged

# Add your custom checks here
echo "🔒 Running security audit..."
npm audit --audit-level=high

echo "✅ All checks passed!"
```

## CI/CD Integration

These same checks should run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Lint
  run: npm run lint

- name: Type Check
  run: npm run build -- --noEmit

- name: Test
  run: npm run test:run
```

This ensures that what passes locally will pass in CI.

## Team Guidelines

1. **Don't skip hooks** unless absolutely necessary
2. **Fix errors immediately** - Don't let them accumulate
3. **Keep commits small** - Faster checks, easier reviews
4. **Run tests locally** during development for faster feedback
5. **Update hooks** when new tools are added to the project

## Additional Hooks

### commit-msg (Currently Disabled)

Optional commit message validation. Uncomment in `.husky/commit-msg` to enforce conventional commit format:

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
refactor: improve code
chore: update dependencies
```

### pre-push

Add a pre-push hook for additional checks before pushing:

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."
npm run build
npm run test:run
```

Create it with:

```bash
npx husky add .husky/pre-push "npm run build && npm run test:run"
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
