// ESLint flat config for Next.js 16 (App Router, JS + JSX).
// eslint-config-next >=16 is natively flat-config; entry[0] covers JS/JSX.
const nextConfig = require('eslint-config-next');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...nextConfig,
  {
    // Project-wide ignores (kept explicit even though the preset adds its own).
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'legacy/**', '.vercel/**'],
  },
  {
    // Keep the codebase tidy without being noisy on a JS-only project.
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@next/next/no-img-element': 'warn',
      'react/no-unescaped-entities': 'off',
    },
  },
];
