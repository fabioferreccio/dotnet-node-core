# dotnet-node-core

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Foundational implementation of a C# Standard Library for Node.js using strict Domain-Driven Design (DDD) and Clean Architecture.

## System Architecture

The project strictly follows a Facade pattern:
- **`src/Domain`**: Contains all business logic and immutable Value Objects.
- **`src/System`**: Re-exports Domain objects to provide the familiar .NET API.

## Supported Types

- `System.String` (CsString) - Immutable string wrapper.
- `System.Guid` (CsGuid) - UUID implementation.
- `System.DateTime` (CsDateTime) - Date wrapper with `Kind` and Formatting.
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

// DateTime Formatting
const now = System.DateTime.Now;
console.log(now.ToString("yyyy-MM-dd HH:mm:ss")); 
// Output: 2026-01-14 12:00:00

// Time Conversion
const utc = now.ToUniversalTime();

// List with Value Objects
const list = new System.Collections.Generic.List<System.Guid>();
list.Add(System.Guid.NewGuid());
```

### SeedWork
The project provides a `ValueObject` base class in `src/Domain/SeedWork/ValueObject.ts` for extending your own domain entities.

## Governance
See [ARCHITECTURE.md](./ARCHITECTURE.md) for strict governance rules.
See [.cursorrules](./.cursorrules) for AI agent standards.
