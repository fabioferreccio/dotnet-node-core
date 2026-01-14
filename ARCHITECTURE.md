# ARCHITECTURE & GOVERNANCE

**Project:** `dotnet-node-core`
**License:** MIT

This document utilizes RFC 2119 keywords (MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL).

## 1. Legal & Compliance
- **License:** The project MUST be released under the **MIT License**.
- **Metadata:** The `package.json` MUST explicitly state `"license": "MIT"`.
- **Compatibility:** No dependencies shall be introduced that are incompatible with the MIT license.

## 2. Domain-Driven Design (DDD) Rules

### 2.1 The Rule of Value Objects
- **No Primitives:** Domain concepts MUST NOT use TypeScript primitives (e.g., `string`, `number`) directly in the domain logic where a strongly-typed Value Object applies.
- **CsString:** The usage of `System.String` (implemented as `CsString`) is MANDATORY for all domain string manipulations.
- **Encapsulation:** Value Objects MUST encapsulate their validation and behavior.

### 2.2 The Rule of Immutability
- **Immutable State:** All Value Objects MUST be immutable.
- **Side-Effect Free:** Methods on Value Objects (e.g., `Trim`, `ToUpper`) MUST return a NEW instance of the Value Object. They MUST NOT modify the internal state of the implementation `this`.

## 3. Clean Architecture Layers
- **Domain (`src/Domain`):** Contains pure business logic, Value Objects, and Shared Kernel interfaces. MUST NOT depend on Infrastructure or System layers.
- **System (`src/System`):** The public API surface mimicking the .NET Standard Library. Depends on Domain.
- **Infrastructure (`src/Infrastructure`):** Implementation details (if any).
- **Tests (`tests`):** MUST mirror the strictness of the Domain.

## 4. Coding Standards
- **Strict Mode:** TypeScript `strict` mode MUST be enabled.
- **Naming:** Classes and Interfaces should follow PascalCase (C# convention). methods should follow PascalCase (C# convention) -> *ADJUSTMENT: We are in TS/JS ecosystem, but aiming for C# feel. We will stick to C# PascaCase for public API methods to truly match .NET, or use camelCase if typical JS/TS is preferred? USER REQUEST asked for C# Standard Library for Node.js. `WriteLine`, `Trim`, `ToUpper` are PascalCase in C#. We will use PascalCase for public members to mimic C# API.*

## 5. Contribution Check
- Any pull request MUST include a verification of `LICENSE` compatibility.
