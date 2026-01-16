---
trigger: always_on
description: Anti-Escape Contract and Governance Rules
---

# ARCHITECTURAL ANTI-ESCAPE CONTRACT

**Scope:** Global Governance
**Enforcement:** Absolute
**Status:** Inviolate

## 1. Introduction
This document defines the **Anti-Escape Rules** for the project. These rules are axioms and admit **NO EXCEPTION**. They bind both human contributors and AI agents to prevent architectural drift and semantic corruption.

## 2. Terminology
- **MUST / MUST NOT:** As defined in RFC 2119. Non-negotiable restrictions.
- **Escape Hatch:** Any mechanism (e.g., `any`, `@ts-ignore`) that bypasses the type system or architectural constraints.
- **Contamination:** The presence of concrete runtime logic in the Domain layer or business logic in the System layer.

## 3. ABSOLUTE RULES

### Rule 1: The Domain Purity Axiom
**Requirement:** The Domain Layer (`src/Domain`) **MUST** contain ONLY conceptual contracts, interfaces, and abstractions.
**Prohibition:** It **MUST NOT** contain concrete runtime types, implementations, or logic.
**Specific Constraint:** `src/Domain` **MUST NOT** contain `Cs*` classes (e.g., `CsString`). These **MUST** reside in `src/System/Types`.
**Reason:** To strictly separate the *definition* of the type system from its *execution*.

### Rule 2: The System Runtime Axiom
**Requirement:** The System Layer (`src/System`) **MUST** contain the concrete implementation of runtime semantics (e.g., `CsString`, `CsInt32`).
**Role:** It is the **Core Runtime Implementation**, NOT a facade.
**Prohibition:** It **MUST NOT** import or depend on business domain concepts (which do not exist in this technical platform).
**Reason:** The System layer emulates the .NET BCL and provides the actual executable behavior.

### Rule 3: The "No Primitives" Access Rule
**Requirement:** Public APIs of System Types **MUST NOT** accept or return native JavaScript primitives (`string`, `number`, `boolean`, `Date`) directly.
**Enforcement:**
- Input arguments **MUST** be strongly typed (e.g., `CsString`, `CsInt32`).
- Return values **MUST** be strongly typed.
**Reason:** To prevent semantic mismatch between TypeScript primitives and .NET semantics.

### Rule 4: The Immutability Mandate
**Requirement:** All System Types **MUST** be structurally immutable.
**Enforcement:**
- `Object.freeze(this)` **MUST** be called at the end of every constructor.
- Mutating methods (e.g., `Trim`, `Add`) **MUST** return a new instance.
- Internal state (`_value`) **MUST** be `readonly` and private.
**Reason:** To guarantee thread-safety and side-effect-free behavior standard in Value Objects.

### Rule 5: The Zero-Escape Clause
**Requirement:** The codebase **MUST** be free of type system suppressions.
**Prohibition:**
- usage of `any` is **FORBIDDEN**.
- usage of `// @ts-ignore` is **FORBIDDEN**.
- usage of `// eslint-disable` is **FORBIDDEN**.
- usage of `require()` is **FORBIDDEN**.
**Reason:** A single suppression compromises the integrity of the entire type system.

### Rule 6: The Strict Construction Rule
**Requirement:** System Types **MUST NOT** expose public constructors.
**Enforcement:**
- Constructors **MUST** be `private` or `protected`.
- Instantiation **MUST** occur via static factories (e.g., `From()`, `Create()`).
**Reason:** To enable flyweight patterns, validation caches, and object pooling without breaking client code.

### Rule 7: The Explicit Interop Rule
**Requirement:** Interoperability with JavaScript **MUST** be strict and explicit.
**Enforcement:**
- Implicit coercion is **FORBIDDEN** except via strictly defined `[Symbol.toPrimitive]`.
- All interop boundaries **MUST** be explicitly documented.
**Reason:** To prevent accidental behavioral bleed (e.g., JS `0` falsiness vs .NET `0` truthiness).

### Rule 8: The Testing Semantics Rule
**Requirement:** Tests **MUST** verify observable behavior and side effects, NOT internal state.
**Prohibition:**
- Tests **MUST NOT** use tautological assertions (e.g., `expect(true).toBe(true)`).
- Tests **MUST NOT** violate encapsulation to inspect private state.
**Reason:** To ensure tests validate the *contract*, not the *implementation*.

---

**AUTHORITY NOTE:**
In the event of any perceived ambiguity, `ARCHITECTURE.md` is the final authority. Use of this document constitutes agreement to these binding rules.