module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'no-constant-condition': ['error', { checkLoops: false }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }
        ],
        // Ensure consistent usage
        'no-var': 'error',
        'prefer-const': 'error',
    },
    env: {
        node: true,
        jest: true,
        es6: true,
    },
    ignorePatterns: ['dist', 'node_modules', '*.js'],
};
