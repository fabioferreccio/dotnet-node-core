# dotnet-node-core

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Foundational implementation of a C# Standard Library for Node.js using strict Domain-Driven Design (DDD) and Clean Architecture.

## Philosophy

- **Governance:** Strict MIT Compliance.
- **Immutability:** All Value Objects are immutable.
- **Type Safety:** No semantic primitives; strongly typed Value Objects.

## Supported Types

- `System.String` (CsString) - Immutable string wrapper.
- `System.Guid` (CsGuid) - UUID implementation.
- `System.DateTime` (CsDateTime) - Date wrapper with 1-based months.
- `System.Int32` (CsInt32) - Enforces 32-bit integer behavior.
- `System.Collections.Generic.List<T>` - List with C#-style equality.

## Usage

```typescript
import { System } from './src/System';

// String
const greeting = new System.String("  Hello World  ");
System.Console.WriteLine(greeting.Trim().ToUpper()); // "HELLO WORLD"

// Guid
const id = System.Guid.NewGuid();
System.Console.WriteLine(id.ToString());

// DateTime
const now = System.DateTime.Now;
const nextWeek = now.AddDays(7);
System.Console.WriteLine(nextWeek.ToString());

// Int32
const i = new System.Int32(5.9); // Truncates to 5
const j = new System.Int32(10);
const sum = i.Add(j);
System.Console.WriteLine(sum); // 15
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for strict governance rules.

### SeedWork
The project provides a `ValueObject` base class in `src/Domain/SeedWork/ValueObject.ts` for extending your own domain entities.
