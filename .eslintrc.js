module.exports = {
  env: {
    es2020: true,
    node: true,
    jest: true,
  },
  extends: ["airbnb-base", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "max-len": "off",
    "arrow-body-style": ["error", "as-needed"],
    "@typescript-eslint/no-explicit-any": "off",
    "import/extensions": ["error", "never"],
    "import/prefer-default-export": "off",
    "no-useless-constructor": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
