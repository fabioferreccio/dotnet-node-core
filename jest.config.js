module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverageFrom: [
        "src/**/*.{ts,js}",
        "!src/System/index.ts",
        "!src/**/index.ts",
        "!src/Domain/Interfaces/**"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.spec.json',
        }],
    },
};
