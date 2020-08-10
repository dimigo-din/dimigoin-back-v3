module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 11,
        "sourceType": "module"
    },
    "plugins": ["@typescript-eslint"],
    "rules": {
        "semi": "off",
        "import/prefer-default-export": "off",
        "import/extensions": "off",
        "import/no-unresolved": "off",
        "lines-between-class-members": "off",
        "consistent-return": "off",
        "no-underscore-dangle": "off",
        "no-param-reassign": "off",
        "max-classes-per-file": "off",
        "class-methods-use-this": "off",
        "@typescript-eslint/no-unused-vars": [
            "error", { "args": "none" }
        ],
        "no-unused-vars": [
            "error", { "args": "none" }
        ],
    },
};
