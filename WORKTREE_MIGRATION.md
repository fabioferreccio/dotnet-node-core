# Worktree Migration Notes

**Status:** Mandatory Migration
**Reason:** Architectural Contamination Correction

## 1. The Invalid State (Current)
The previous worktree structure allowed **System Runtime Types** (e.g., `CsString`, `CsBoolean`) to reside within the **Domain Layer** (`src/Domain/ValueObjects`).

### Why this is INVALID:
1.  **Domain Contamination:** It treated technical runtime primitives as "Business Value Objects". `CsInt32` is not a business concept; it is a fundamental building block of the virtual machine.
2.  **Circular Logic:** The System layer is supposed to implement the runtime, but the runtime's fundamental types were trapped in the abstract Domain layer.
3.  **Semantic Mismatch:** It confused "Value Object" (DDD pattern) with "Value Type" (.NET CLR concept).

## 2. The Canonical State (New)
The new structure enforces strict separation between **Contracts** and **Implementation**.

### 2.1 Changes Required
You MUST perform the following filesystem moves immediately:

| Source (Legacy) | Destination (Canonical) | Reason |
| :--- | :--- | :--- |
| `src/Domain/ValueObjects/CsString.ts` | `src/System/Types/CsString.ts` | Implementation moves to System. |
| `src/Domain/ValueObjects/CsBoolean.ts` | `src/System/Types/CsBoolean.ts` | Implementation moves to System. |
| `src/Domain/ValueObjects/*` | `src/System/Types/*` | All runtime primitives are System Types. |
| `src/Domain/Interfaces/*` | `src/Domain/Abstractions/*` | Renaming for clarity (Abstractions). |

### 2.2 The Resulting Hierarchy
- **`src/Domain`** is now pure. It contains NO executable code, only Definitions.
- **`src/System`** is now complete. It contains ALL runtime behavior.

## 3. Enforcement
- **AI Agents** will reject any attempt to place `Cs*` classes in `src/Domain`.
- **Human Contributors** must adhere to the `src/System` root for all logic.
