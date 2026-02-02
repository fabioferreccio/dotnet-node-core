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

## 📦 Installation

This library cannot yet be installed through the official NPM registry, but it can be installed directly from the GitHub repository.

### Option 1: Via GitHub
To install the latest version directly from the GitHub repository:

Latest Version
```bash
npm install github:fabioferreccio/dotnet-node-core
```

### Option 2: Pre-compiled Package (.tgz)
The "dotnet-node-core-v0.6.4.tgz" file available in the Assets section is a production-ready package. Unlike the source code (zip), it requires no compilation steps.

How to install this file:
1. Download the .tgz file.
2. Run the following command in your project:

```bash
npm install ./path/to/dotnet-node-core-v0.6.4.tgz
```

### 🔄 Updating (GitHub Installation)
If you installed via GitHub, NPM may cache the dependency. To force an update to the latest release:

```bash
# Update to latest main
npm install github:fabioferreccio/dotnet-node-core --force

# Or switch to a specific tag
npm install github:fabioferreccio/dotnet-node-core#v0.6.4
```

---

## 📦 System Types & Primitives (v0.6.6)

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
| **System.Console** | `AnsiConsole` | Rich output with Markup, Tables, Panels, and Rules. |
| **System.CommandLine** | `Parser` / `Binding` | Hardened CLI infrastructure with decoupled execution. |


---

## 💻 Usage Showcase

### 1. Immutability & String Behavior
Unlike JavaScript strings, `System.String` is a Value Object. Modifications create new instances.

```typescript
import { System } from 'dotnet-node-core';

const original = System.String.From("  dotnet-node-core  ");
const clean = original.Trim().ToUpper();

System.Console.WriteLine(original); // Prints: "  dotnet-node-core  " (Unchanged)
System.Console.WriteLine(clean);    // Prints: "DOTNET-NODE-CORE" (New Instance)
```

### 2. System.IO (File Operations)
Perform synchronized I/O with strict path handling and stream support.

```typescript
import { System } from 'dotnet-node-core';

const path = "./output.txt";
const content = "Hello World";

// Write to file
System.IO.File.WriteAllText(path, content);
```

### 3. System.Linq (Querying)
Use standard LINQ operators on collections.

```typescript
import { System, List, Int32, Enumerable } from 'dotnet-node-core';

const numbers = new List<Int32>();
numbers.Add(Int32.From(10));
numbers.Add(Int32.From(20));

const query = Enumerable.From(numbers)
    .Where(x => x.Value > 15)
    .Select(x => x.ToString());
    
System.Console.WriteLine(query.First()); // "20"
```

### 4. Dependency Injection & @Inject
A clean, standards-compliant IoC container with support for Interface resolution.

```typescript
import { ServiceCollection, Injectable, Inject } from 'dotnet-node-core';

interface ILogger {
    Log(message: string): void;
}

@Injectable()
class MyLogger implements ILogger {
    Log(message: string): void {
        console.log(message);
    }
}

@Injectable()
class MyService {
    // @Inject("Token") solves TypeScript interface erasure at runtime
    constructor(@Inject("ILogger") private logger: ILogger) {}
}

const services = new ServiceCollection();
services.AddSingleton("ILogger", MyLogger);
services.AddTransient(MyService);

const provider = services.BuildServiceProvider();
const myService = provider.GetRequiredService(MyService);
```

---

## 🏗 Architecture & Governance
This project follows strict architectural rules to ensure maintainability and compliance.

- [ARCHITECTURE.md](docs/ARCHITECTURE.md): The "Constitution" of the project.
- [SERIALIZATION.md](docs/SERIALIZATION.md): JSON Usage, Metadata, & Diagnostics.
- [DEPENDENCY_INJECTION.md](docs/DEPENDENCY_INJECTION.md): Service Lifetimes & Patterns.
- [TYPES.md](docs/TYPES.md): CsString, CsInt32, and "No Primitives" Guide.
- [COMMAND_LINE.md](docs/COMMAND_LINE.md): CLI Parsing, Binding, and Execution (Experimental).

### Project Structure (Expanded)
- [src/Domain](src/Domain): The Core. Conceptual Contracts and Interfaces.
- [src/System](src/System): The Runtime.
    - `Types`: Primitive Value Objects (`CsInt32`, `CsString`).
    - `IO`: File and Stream handling.
    - `Linq`: Query operators.
    - `DependencyInjection`: DI Container implementation.
    - `Net`: HTTP Primitives (Headers, Methods).
    - `Text.Json`: Serialization engine.
    - `CommandLine`: Hardened CLI infrastructure.

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