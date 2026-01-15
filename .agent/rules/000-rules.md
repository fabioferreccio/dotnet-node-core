---
trigger: always_on
---

# Project: dotnet-node-core
# Role: Principal C#/.NET Architect porting to TypeScript.

## 1. Architecture & Pattern
- **Style:** Clean Architecture + Domain-Driven Design (DDD).
- **Structure:**
  - `src/Domain/ValueObjects`: Core Logic (e.g., `CsString`, `CsGuid`).
  - `src/System`: Facade Layer ONLY. Exports Domain objects.
  - `tests/`: Mirrors the `src` folder structure.

## 2. The "No Primitives" Rule
- **Strict Prohibition:** NEVER use native TypeScript primitives (`string`, `number`, `Date`) for exposed System types.
- **Enforcement:**
  - `string` -> `CsString`
  - `number` (int) -> `CsInt32`
  - `number` (long) -> `CsInt64` (BigInt)
  - `Date` -> `CsDateTime`

## 3. Immutability & State
- **Rule:** All Value Objects are **Immutable**.
- **Behavior:** Methods modifying data (`Trim`, `AddDays`) MUST return a `new` instance.
- **State:** Never mutate `_value` after the constructor.

## 4. Contracts & Equality
- All Domain Types must implement:
  - `IEquatable<T>`: Structural equality (`new A(1).Equals(new A(1))` is true).
  - `IComparable<T>`: Returns `-1`, `0`, `1`.
- **Handling Nulls:** `CompareTo(null)` must return `1` (Standard C# behavior).

## 5. Testing Standards (QA Protocol)
- **Metric:** Aim for **100% Branch Coverage**.
- **Anti-Hallucination Rule:**
  - Do not write assertions like `expect(true).toBe(true)`.
  - Assertions must verify **Side Effects** or **Return Values**.
  - **Immutability Check:** Always verify that the original object remains unchanged after an operation.
- **Mandatory Scenarios per Type:**
  - **Happy Path:** Standard usage.
  - **Boundary:** MinValue, MaxValue.
  - **Overflow:** `MaxValue + 1` (Must throw).
  - **Truncation:** Floating points passed to Int constructors (Must truncate).
  - **Null/Undefined:** `CompareTo(null)`, `Equals(null)`.

## 6. Licensing
- **License:** MIT.
- `package.json` and `LICENSE` must be in sync.

## 7. Module System & Code Style
- **Strict ES6 Modules:** Use `import` and `export` ONLY.
- **Prohibited:** NEVER use `require()`, `module.exports`, or `exports.foo`.
- **Barrel Files:** Use `index.ts` to aggregate exports.
- **Namespace Construction:** Import namespaces statically (`import * as Namespace`).

## 8. Code Discipline & Quality (Zero Tolerance)
- **Zero Suppression Policy:** Usage of `// eslint-disable`, `// @ts-ignore`, or `// @ts-nocheck` is **STRICTLY PROHIBITED**.
  - **Fix, Don't Hide:** Solve type errors using Generics, `unknown` + Type Guards, or architectural refactoring.
- **Strong Typing:**
  - **Prohibited:** `Function` type (use `(...args: any[]) => void` or specific delegates).
  - **Prohibited:** Unjustified `any`.
  - **Prohibited:** Empty Interfaces (Exception: DDD Marker Interfaces MUST have a comment explanation).
- **No Loose TODOs:** Comments like `// TODO: Implement later` are forbidden.
  - **Rule:** Either implement the feature immediately or omit the comment. Code committed must be complete or explicitly marked as `NotImplementedException`.

## 9. Explicit Resource Management (IDisposable)
- **Standard:** Use the TypeScript 5.2+ `using` keyword support.
- **Requirement:** All classes implementing `IDisposable` MUST also implement `[Symbol.dispose]` (and `[Symbol.asyncDispose]` if applicable).
- **Leak Prevention:** Every `FileStream`, `NetworkStream`, or `DBConnection` MUST be wrapped in a `using` block in the consumer side.

## 10. Asynchrony & Event Loop (TPL Pattern)
- [cite_start]**Naming:** Asynchronous methods MUST end with the `Async` suffix (e.g., `ReadAsync`). 
- **Return Type:** Use `Task<T>` as a type alias for `Promise<T>` to maintain .NET naming conventions.
- **Offloading:** Heavy CPU-bound tasks in the Domain layer SHOULD be avoided or implemented via Worker Threads if they block the Event Loop for >50ms.
- **I/O Policy:** For high-concurrency implementations, `Async` methods are MANDATORY. `Sync` methods are reserved for CLI tools or initialization phases.

## 11. Memory & Allocation (Performance)
- [cite_start]**Small Data:** Immutability is mandatory for Value Objects. [cite: 7, 8, 11]
- **Large Data:** For payloads >1MB, the "Stream-First" policy applies. Use `System.IO.Stream` to process data in chunks instead of loading full `CsString` instances into memory.
- **Buffers:** Reuse `Uint8Array` via `ArrayBuffer` pools for high-frequency I/O operations to mitigate GC pressure.
