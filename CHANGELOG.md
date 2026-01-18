# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
