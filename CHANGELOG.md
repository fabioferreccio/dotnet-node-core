# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.4] - 2026-02-02

### Added
- **DI @Inject Decorator**: New `@Inject(token)` parameter decorator to handle TypeScript interface type erasure.
- **Root Interface Exports**: `IServiceProvider`, `IServiceCollection`, `IDisposable`, and others are now exported from the root `index.ts`.
- **DI Diagnostics**: `ServiceProvider` now emits a `console.warn` when a dependency resolves to `Object` due to type erasure, suggesting `@Inject`.
- **Strict Construction**: `ServiceProvider` and `ServiceScope` now follow **Rule 6** (Strict Construction) with private constructors and static `Create()` methods.
- **Governance Rule 9**: Added "The Public API Exposure Axiom" to ensure all future features are exported at the root.

### Fixed
- **Rule 5 Compliance**: Removed `any` usages and `eslint-disable` suppressions in `Injectable.ts`.
- **Typing Safety**: Fixed `unsafe-function-type` and empty-interface lint errors in tests and core logic.

## [0.6.3] - 2026-02-02

### Changed
- **Packaging**: Simplified root imports by adding the `exports` field to `package.json`, preventing deep `dist/` imports.

## [0.6.2] - 2026-02-02

### Fixed
- **Bugfix**: Exported `@Injectable` decorator which was missing from the named exports in version 0.6.1.

## [0.6.0] - 2026-01-18

### Added
- **Public API Freeze**: Explicit export of `System.Text` and children. All other APIs are now Internal.
- **Serialization Metadata**: `System.Text.Json.Metadata` for strict type mapping and polymorphic support.
- **Diagnostics**: `System.Text.Json.Diagnostics` for performance tracing and error logging.
- **Documentation**: New authoritative guides in `docs/`:
    - `ARCHITECTURE.md` (Constitutional rules)
    - `SERIALIZATION.md` (JsonSerializer usage)
    - `DEPENDENCY_INJECTION.md` (IoC container usage)
    - `TYPES.md` (Type system philosophy)

### Changed
- **Moved**: `ARCHITECTURE.md` moved from root to `docs/ARCHITECTURE.md`.
- **Api Stability**: Public APIs (exported via `System`) are now guaranteed stable within Major versions.
- **Internal Visibility**: Non-exported types are considered volatile and subject to change.

### Locked
- **Dependencies**: No new dependencies added. Project remains zero-dependency (excluding devDependencies).
