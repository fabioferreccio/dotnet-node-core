# Project: dotnet-node-core
# Role: Principal C#/.NET Architect porting to TypeScript.

## 1. Architecture & Pattern
- **Style:** Clean Architecture + Domain-Driven Design (DDD).
- **Structure:**
  - `src/Domain/ValueObjects`: Contains the Core Logic (e.g., `CsString`, `CsGuid`).
  - `src/System`: Facade Layer ONLY. Exports Domain objects (e.g., `export { CsString as String }`).
  - `tests/`: Mirrors the `src` folder structure.

## 2. The "No Primitives" Rule
- **Strict Prohibition:** NEVER use native TypeScript primitives (`string`, `number`, `Date`) for exposed System types.
- **Enforcement:**
  - Use `CsString` instead of `string`.
  - Use `CsInt32` instead of `number`.
  - Use `CsDateTime` instead of `Date`.
  - Use `CsGuid` instead of string UUIDs.

## 3. Immutability & State
- All Value Objects must be **Immutable**.
- Methods that modify data (e.g., `Trim`, `AddDays`) MUST return a `new` instance.
- Deep Freeze is preferred where performance allows, but logical immutability is mandatory.

## 4. Contracts
- All Domain Types must implement:
  - `IEquatable<T>` (Logic: `this.value === other.value`)
  - `IComparable<T>`

## 5. Testing Standards
- **Framework:** Jest + ts-jest.
- **Rule:** Test the source `.ts` files, NOT the compiled `.js`.
- **Integration:** Verify `List<T>` works with `IEquatable` logic (e.g., `List.Remove(new CsString("x"))` must work).

## 6. Licensing
- **License:** MIT.
- Ensure `package.json` and `LICENSE` file stay in sync.
