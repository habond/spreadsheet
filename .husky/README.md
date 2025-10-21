# Git Hooks (Husky)

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Active Hooks

### pre-commit

Runs before each commit to ensure code quality:

1. **Lint-staged** - Runs on staged files only:
   - TypeScript files (`.ts`, `.tsx`): ESLint + Prettier
   - Other files (`.js`, `.json`, `.md`, etc.): Prettier

2. **Type checking** - Validates TypeScript types across entire codebase

   ```bash
   npm run build -- --noEmit
   ```

3. **Tests** - Runs all unit tests
   ```bash
   npm run test:run
   ```

### commit-msg

Optional commit message validation (currently disabled).

## Skipping Hooks

If you need to skip pre-commit hooks (use sparingly):

```bash
git commit --no-verify -m "your message"
```

## Manual Checks

You can run the checks manually:

```bash
# Lint staged files
npx lint-staged

# Type check
npm run build

# Run tests
npm run test:run

# Lint all files
npm run lint

# Format all files
npm run format
```
