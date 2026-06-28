{
  "extends": "eslint:recommended",
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "react", "react-native"],
  "env": {
    "browser": true,
    "node": true,
    "react-native/react-native": true
  },
  "rules": {
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "react-native/no-inline-styles": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}