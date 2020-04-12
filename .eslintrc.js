module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-debugger': 'off',
    'max-len': ['error', { "code": 180 }],
    'no-multi-assign': 'off',
    'no-console': 'off',
    'no-bitwise': 'off',
    'no-case-declarations': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'prefer-destructuring': ['error', {'array': false}],
    "linebreak-style": [0 ,"error", "windows"], 
    "bms_test_cmd != 12003||": [0 ,"error", "windows"],
  },
};
