# Linter in the service

We're using ESLint to ensure basic code readability and style consistency.

To run linter locally, please enter in the terminal:

```bash
npx eslint .
```

This might return some linter errors, some of them can be fixed using:

```bash
npx eslint . --fix
```

You can actually run with --fix from the beginning and then deal only with errors that should be handled manually.

The rules for the linter can be found in the `eslint.config.mjs` file. If you think any additional rule might be useful for our codebase, navigate to https://eslint.org/docs/latest/rules to find the one you need and its syntax, then update the config.