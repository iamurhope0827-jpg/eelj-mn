import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  { files: ['app.js'], languageOptions: { sourceType: 'script', globals: globals.browser } },
  { rules: { 'no-unused-vars': ['error', { ignoreRestSiblings: true }] } },
  { files: ['scripts/**/*.mjs', '*.config.js'], languageOptions: { sourceType: 'module', globals: globals.node } },
  // Tests run in Node but pass callbacks to page.evaluate that run in the browser.
  { files: ['tests/**/*.js'], languageOptions: { sourceType: 'module', globals: { ...globals.node, ...globals.browser } } }
];
