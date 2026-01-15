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
