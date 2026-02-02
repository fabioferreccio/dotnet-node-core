# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.5] - 2026-02-02

### Added
- **Phase 8 Console Infrastructure (AnsiConsole)**: Introduced rich console output capabilities including colors, markup, and widgets.
- **Rich Widgets**: Added `Rule`, `Panel`, and `Table` widgets for structured console presentation.
- **Markup Engine**: Private internal engine for semantic styling (e.g., `[red]text[/]`).
- **Deterministic Layout Policy**: Enforced an 80-character default width for stable, environment-independent rendering.

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

## [0.6.1] - 2026-01-20

### Added
- **System Types Expansion**: Added comprehensive numeric support: `CsByte`, `CsSByte`, `CsInt16`, `CsInt64`, `CsSingle`, `CsDouble`, `CsDecimal`.
- **Core Primitives**: Added `CsBoolean` value object.

## [0.6.0] - 2026-01-18

### Added
- **Public API Freeze**: Explicit export of `System.Text` and children. All other APIs are now Internal by default.
- **Serialization Metadata**: `System.Text.Json.Metadata` for strict type mapping and polymorphic support.
- **Diagnostics**: `System.Text.Json.Diagnostics` for performance tracing and error logging.
- **Authoritative Guides**: Added `ARCHITECTURE.md`, `SERIALIZATION.md`, `DEPENDENCY_INJECTION.md`, and `TYPES.md` to `docs/`.

### Changed
- **Governance**: Implemented Anti-Escape rules for Domain Purity and System Runtime.

## [0.5.1] - 2026-01-17

### Fixed
- **Test Alignment**: Standardized test suites to follow `ARCHITECTURE.md` requirements.
- **Bugfixes**: Resolved minor issues in LINQ enumerators.

## [0.5.0] - 2026-01-16

### Added
- **System.IO**: Initial implementation of `File` and `Directory` static utilities.
- **System.Linq**: Basic LINQ operators: `Where`, `Select`, `ToList`, `First`, `FirstOrDefault`.

## [0.4.0] - 2026-01-16

### Added
- **Internal Pooling**: Implemented `ObjectPool` for `JsonSerializer` to reduce GC pressure during high-throughput deserialization.

## [0.3.0] - 2026-01-16

### Added
- **System.Text.Json**: Initial implementation of the `JsonSerializer`.

## [0.2.0] - 2026-01-15

### Added
- **Core Types**: Initial implementation of `CsString`, `CsGuid`, and `CsDateTime`.

## [0.1.0] - 2026-01-14

### Added
- **Project Structure**: Initial setup of Domain and System layers.
- **Base Interfaces**: Definition of `IDisposable`, `IServiceProvider`, and `IEnumerable`.
