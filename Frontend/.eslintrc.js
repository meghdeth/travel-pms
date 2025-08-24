module.exports = {
  root: true,
  extends: ['next/core-web-vitals', '@next/eslint-config-next'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error'
  },
  ignorePatterns: ['dist/', '.next/', 'node_modules/']
};