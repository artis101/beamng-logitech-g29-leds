module.exports = {
  extends: ["eslint:recommended", "prettier"],
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    "jest/globals": true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": "off",
    quotes: ["error", "double"],
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
  },
  overrides: [],
  plugins: ["jest"],
};
