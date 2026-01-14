# dotnet-node-core

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Foundational implementation of a C# Standard Library for Node.js using strict Domain-Driven Design (DDD) and Clean Architecture.

## Philosophy

- **Governance:** Strict MIT Compliance.
- **Immutability:** All Value Objects are immutable.
- **Type Safety:** No semantic primitives; strongly typed Value Objects.

## Usage

```typescript
import { System } from './src/System';

const greeting = new System.String("  Hello World  ");
const clean = greeting.Trim().ToUpper();

System.Console.WriteLine(clean); // "HELLO WORLD"
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for strict governance rules.
