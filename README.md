# dotnet-node-core

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![Architecture](https://img.shields.io/badge/Architecture-DDD%20%2B%20Clean-orange.svg)](ARCHITECTURE.md)

> **The C# Standard Library for Node.js.**
> A strict, immutable, and type-safe implementation of the .NET ecosystem in TypeScript, built with Domain-Driven Design (DDD) principles.

---

## 🚀 Overview

`dotnet-node-core` is not just a collection of helper functions. It is a rigorous port of the `System` namespace, designed for developers who demand the structural integrity of C# within the Node.js environment.

### Core Principles
1.  **No Primitives:** Public APIs expose strongly-typed Value Objects (`CsString`, `CsInt32`), not native JS primitives.
2.  **Immutability:** All Value Objects are immutable. Operations like `.Trim()` or `.AddDays()` return new instances.
3.  **Structural Equality:** Implements `IEquatable<T>`. Collections like `List<T>` use `.Equals()` checks, not reference equality (`===`).
4.  **Zero Dependencies:** Built from scratch using native TypeScript features.

---

## 📦 System Types & Primitives (v0.5.0)

Now supporting a comprehensive suite of .NET numerics and core types.

| Namespace | Type | Description |
| :--- | :--- | :--- |
| **System** | `CsString` | Immutable string with `Format`, `Trim`, `ToUpper`. |
| **System** | `CsBoolean` | Strongly-typed boolean values. |
| **System** | `CsGuid` | `NewGuid()`, `Parse()`, `Empty`. |
| **System** | `CsDateTime` | `Kind` (Utc/Local), `ToString(format)`, Arithmetic. |
| **System** | `CsInt32` / `CsInt64` | 32-bit and 64-bit signed integers. |
| **System** | `CsDouble` / `CsSingle` | IEEE 754 floating-point numbers. |
| **System** | `CsDecimal` | High-precision decimal for financial calculations. |
| **System.Collections** | `List<T>` | Generic List with `Where`, `Select`, and equality checks. |
| **System.IO** | `File` / `Directory` | Static methods for file system operations. |
| **System.IO** | `Stream` | Abstract base for `FileStream` and `MemoryStream`. |
| **System.Linq** | `Enumerable` | Static query operators (`Where`, `Select`, `ToList`). |
| **System.DI** | `ServiceCollection` | Strict Dependency Injection container / IoC. |

---

## 💻 Usage Showcase

### 1. Immutability & String Behavior
Unlike JavaScript strings, `System.String` is a Value Object. Modifications create new instances.

```typescript
import { System } from './src/System';

const original = System.String.From("  dotnet-node-core  ");
const clean = original.Trim().ToUpper();

System.Console.WriteLine(original); // Prints: "  dotnet-node-core  " (Unchanged)
System.Console.WriteLine(clean);    // Prints: "DOTNET-NODE-CORE" (New Instance)
```

### 2. System.IO (File Operations)
Perform synchronized I/O with strict path handling and stream support.

```typescript
import { System } from './src/System';

const path = "./output.txt";
const content = "Hello World";

// Write to file
System.IO.File.WriteAllText(path, content);

// Read using Stream
const stream = System.IO.File.ReadAllText(path);
// ... operations
```

### 3. System.Linq (Querying)
Use standard LINQ operators on collections.

```typescript
const numbers = new System.Collections.Generic.List<System.Int32>();
numbers.Add(System.Int32.From(10));
numbers.Add(System.Int32.From(20));

const query = System.Linq.Enumerable.From(numbers)
    .Where(x => x.Value > 15)
    .Select(x => x.ToString());
    
System.Console.WriteLine(query.First()); // "20"
```

### 4. Dependency Injection
A clean, standards-compliant IoC container.

```typescript
import { System } from './src/System';

// Register Services
const services = new System.DependencyInjection.ServiceCollection();
// services.AddSingleton(MyService);

// Build Provider
const provider = services.BuildServiceProvider();
// const myService = provider.GetService(MyService);
```

---

## 🏗 Architecture & Governance
This project follows strict architectural rules to ensure maintainability and compliance.

- [ARCHITECTURE.md](docs/ARCHITECTURE.md): The "Constitution" of the project.
- [SERIALIZATION.md](docs/SERIALIZATION.md): JSON Usage, Metadata, & Diagnostics.
- [DEPENDENCY_INJECTION.md](docs/DEPENDENCY_INJECTION.md): Service Lifetimes & Patterns.
- [TYPES.md](docs/TYPES.md): CsString, CsInt32, and "No Primitives" Guide.

### Project Structure (Expanded)
- [src/Domain](src/Domain): The Core. Conceptual Contracts and Interfaces.
- [src/System](src/System): The Runtime.
    - `Types`: Primitive Value Objects (`CsInt32`, `CsString`).
    - `IO`: File and Stream handling.
    - `Linq`: Query operators.
    - `DependencyInjection`: DI Container implementation.
    - `Net`: HTTP Primitives (Headers, Methods).
    - `Text.Json`: Serialization engine.

---

## 🧪 Testing
We use Jest with ts-jest to test the source code directly (not the compiled JS).

```bash
# Run all unit and integration tests
npm test

# Run a specific test file
npm test src/Domain/Tests/MyTest.spec.ts
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.