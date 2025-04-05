/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: ['!**/.server', '!**/.client'],

  // Base config
  extends: ['eslint:recommended'],

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      rules: {
        // Disable prop-types as we're using TypeScript for type checking
        'react/prop-types': 'off',
        // Disable import/no-unresolved for SVG imports which use Vite's special syntax
        'import/no-unresolved': [
          'error',
          {
            ignore: ['\\.svg\\?url$'],
          },
        ],
        // Disable label association rule since we're using aria-labelledby instead
        'jsx-a11y/label-has-associated-control': 'off',
        // Change exhaustive-deps to warning level
        'react-hooks/exhaustive-deps': 'warn',
      },
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
        'import/resolver': {
          typescript: {},
        },
      },
    },

    // Typescript
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'import'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/internal-regex': '^~/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
    },

    // Node files (migrations, seeds, scripts)
    {
      files: [
        '.eslintrc.cjs',
        'server.js',
        'knexfile.js',
        'scripts/**/*.js',
        'db/migrations/**/*.js',
        'db/seeds/**/*.js',
      ],
      env: {
        node: true,
      },
    },
  ],
}
