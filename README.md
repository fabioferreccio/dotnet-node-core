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

## 📦 Supported Types (v0.1.0)

| Type | Description | Key Features |
| :--- | :--- | :--- |
| **`System.String`** | `CsString` | Immutable, `Format`, `Trim`, `ToUpper`, Value Equality. |
| **`System.Int32`** | `CsInt32` | Enforces 32-bit integers, checked arithmetic methods. |
| **`System.Guid`** | `CsGuid` | `NewGuid()`, `Parse()`, `Empty`. |
| **`System.DateTime`** | `CsDateTime` | `Kind` (Utc/Local), `ToString(format)`, Date Arithmetic. |
| **`System.Collections`** | `List<T>` | Generic List with LINQ-like basics (`Where`, `Select`) and smart equality. |

---

## 💻 Usage Showcase

### 1. Immutability & String Behavior
Unlike JavaScript strings, `System.String` is a Value Object. Modifications create new instances.

```typescript
import { System } from './src/System';

const original = new System.String("  dotnet-node-core  ");
const clean = original.Trim().ToUpper();

System.Console.WriteLine(original); // Prints: "  dotnet-node-core  " (Unchanged)
System.Console.WriteLine(clean);    // Prints: "DOTNET-NODE-CORE" (New Instance)
```

### 2. DateTime Formatting & Kind
Full support for C# custom date format strings without external libraries.

```typescript
const now = System.DateTime.Now;

// Custom C# Style Formatting
System.Console.WriteLine(now.ToString("yyyy-MM-dd HH:mm:ss")); 
// Output: 2026-01-14 08:30:00

// TimeZone / Kind Handling
const utcDate = now.ToUniversalTime();
System.Console.WriteLine(utcDate.Kind); // "Utc"
```

### 3. Smart Collections (The C# Equality)
The most powerful feature. List<T> respects IEquatable. In standard JS arrays, removing a new object instance fails. Here, it works.

```typescript
const list = new System.Collections.Generic.List<System.String>();
list.Add(new System.String("Item 1"));

// Create a DIFFERENT instance with the SAME value
const itemToRemove = new System.String("Item 1"); 

// Works because CsString implements IEquatable<CsString>
const removed = list.Remove(itemToRemove); 

System.Console.WriteLine(`Removed: ${removed}`); // True
System.Console.WriteLine(`Count: ${list.Count}`); // 0
```

---

## 🏗 Architecture & Governance
This project follows strict architectural rules to ensure maintainability and compliance.

- [ARCHITECTURE.md](ARCHITECTURE.md): The "Constitution" of the project. Details the folder structure, strict typing rules, and Facade pattern.

- [.agent/rules/](.agent/rules/000-rules.md): Guidelines for AI Agents (Cursor/Copilot) to maintain code quality and prevent primitive obsession.

### Project Structure
- [src/Domain](src/Domain): The Core. Contains logic, Value Objects, and Interfaces (IEquatable).
- [src/System](src/System): The Facade. Only exports/wraps Domain objects to expose the public API.

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