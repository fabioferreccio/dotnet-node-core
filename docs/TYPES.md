# System Types Documentation

## Philosophy
`dotnet-node-core` adheres to the "No Primitives" rule. We do not use raw JavaScript primitives (`string`, `number`, `boolean`) in public APIs. Instead, we use **Value Objects** that emulate .NET semantics.

### Why?
1. **Immutability**: JS strings are immutable, but `Date` is not. Our `CsDateTime` is.
2. **Method Parity**: JS `number` lacks methods like `ToString("N2")`. Our `CsInt32` has them.
3. **Type Safety**: Distinguish between `Int32`, `Int64`, `Double`, and `Decimal` at the type level.

## Core Types

| .NET Type | JS Primitive | System Type | Features |
| :--- | :--- | :--- | :--- |
| `String` | `string` | `CsString` | `Format`, `Trim`, `ToUpper`, `Contains` |
| `Int32` | `number` | `CsInt32` | 32-bit signed, overflow checks |
| `Boolean` | `boolean` | `CsBoolean` | `TrueString`, `FalseString` |
| `DateTime`| `Date` | `CsDateTime` | `Kind` (Utc/Local), Arithmetic |
| `Guid` | `string` | `CsGuid` | `NewGuid`, `Parse` |

## Usage Guide

### 1. CsString
Strings are immutable wrappers.

```typescript
import { System } from '../../src/System';

const str = System.String.From(" Hello ");
const trimmed = str.Trim();

// Equality
if (trimmed.Equals(System.String.From("Hello"))) {
    // True
}

// Strict check: === will be false because they are different objects!
// ALWAYS use .Equals()
```

### 2. CsInt32 & Numerics
Numbers are strongly typed.

```typescript
const age = System.Int32.From(25);
const year = System.Int32.From(2023);

// Arithmetic (returns new instance)
const nextYear = year.Add(System.Int32.From(1));
```

### 3. Explicit Interop
We allow explicit conversion to/from JS primitives for boundary layers (UI, Database), but NOT inside the Domain.

```typescript
// Input from JS
const input: string = "some input";
const csVal = System.String.From(input);

// Output to JS
const jsVal: string = csVal.ToString();
```

## Equality Contract
**Rule**: NEVER use `===` for System types.
**Rule**: ALWAYS use `.Equals()`.

All System types implement `IEquatable<T>`.

```typescript
const a = System.Int32.From(5);
const b = System.Int32.From(5);

console.log(a === b); // FALSE (Referential Inequality)
console.log(a.Equals(b)); // TRUE (Structural Equality)
```
