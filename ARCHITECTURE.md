# ARCHITECTURE & GOVERNANCE

**Project:** `dotnet-node-core`
**License:** MIT
**Status:** Normative Specification (Rev. 2.1)
**Scope:** Technical Runtime Platform

## 1. Introduction & Core Mandate

This project is a **Technical Runtime Compatibility Platform**. It provides a high-fidelity emulation of the .NET Base Class Library (BCL) for the Node.js/TypeScript ecosystem.

### 1.1 Normative Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119].

### 1.2 The "No Business Logic" Axiom
- This project **MUST NOT** contain business domain logic (e.g., "User", "Order", "Money").
- This project **MUST** contain technical runtime logic (e.g., "String", "Int32", "MemoryStream").
- All architectural principles defined herein **MUST** be interpreted through the lens of **Runtime Engineering**, not Application Development.

---

## 2. Clean Architecture Strategy

Clean Architecture in this project governs the **Dependency Direction** and **Semantic Isolation** between the Type System Definitions (Domain) and the Runtime Execution (System).

### 2.1 The Dependency Rule
- **Source Code Dependencies MUST point inwards.**
- **Inner Layer:** `src/Domain` (Conceptual Contracts)
- **Outer Layer:** `src/System` (Runtime Implementation)

### 2.2 Layer Definitions

#### 2.2.1 Domain Layer (`src/Domain`)
- **Role:** Defines the **Conceptual Type System**.
- **Content:** Interfaces, Abstractions, Pure Contracts.
- **Constraints:**
    - **MUST NOT** import concrete types.
    - **MUST NOT** contain runtime logic.
    - **MUST NOT** depend on Node.js globals (e.g., `process`, `Buffer`).

#### 2.2.2 System Layer (`src/System`)
- **Role:** Implements the **Runtime Execution Environment**.
- **Content:** Concrete Types, Logic, Algorithms, Platform Interop.
- **Constraints:**
    - **MUST** implement contracts defined in `src/Domain`.
    - **MUST** completely encapsulate JavaScript primitives.
    - **MUST** provide the public API surface.

### 2.3 DOs and DON'Ts

| Consequence | Clean Architecture Rule |
| :--- | :--- |
| ✅ **DO** | Define `ICloneable` in `src/Domain/Abstractions`. |
| ✅ **DO** | Implement `CsString` in `src/System/Types`. |
| ❌ **DON'T** | Place `CsString` in `src/Domain` (This is contamination). |
| ❌ **DON'T** | Allow `src/Domain` to import `src/System`. |

---

## 3. Domain-Driven Design (DDD) Strategy

Since this is a technical platform, "Domain" refers to the **Technical Domain of Type Theory**, not a Business Domain.

### 3.1 Conceptual vs. Technical Domains

| Concept | Application DDD | Runtime Platform DDD (This Project) |
| :--- | :--- | :--- |
| **Domain** | Modeling Business Rules | Modeling Type System Semantics |
| **Value Object** | Immutable Business Data (Money) | Immutable Runtime Primitives (CsInt32) |
| **Entity** | Mutable Business State (User) | Mutable System Resources (FileStream) |
| **Repository** | Database Access | (Not Applicable) types are self-contained |

### 3.2 Classification of Types

- **Conceptual Domain (Abstract):** `IEquatable<T>`, `IComparable<T>`, `IDisposable`.
    - **Location:** `src/Domain/Abstractions`
- **System Primitives (Concrete):** `CsString`, `CsInt32`, `CsBoolean`.
    - **Location:** `src/System/Types`
- **System Resources (Concrete):** `CsConsole`, `CsEnvironment`.
    - **Location:** `src/System/IO` or `src/System/Runtime`

### 3.3 The "No Fake Value Objects" Rule
System Types (e.g., `CsString`) **MUST NOT** be treated as "Domain Value Objects" in the directory structure. They are **Fundamental Runtime Types** and belong in the System layer.

---

## 4. SOLID Principles Strategy

SOLID principles **MUST** be applied to enforce Type System correctness and API stability.

### 4.1 Single Responsibility Principle (SRP)
- **Rule:** A Type **MUST** represent exactly one runtime concept.
- **Example:** `CsString` **MUST** manage string semantics. It **MUST NOT** handle console output or file I/O.

### 4.2 Open/Closed Principle (OCP)
- **Rule:** Runtime behaviors **SHOULD** be extensible via Extension Methods (static helpers) or Interfaces, rather than inheritance chains.
- **Constraint:** Fundamental Types (`CsString`) **MUST** be sealed (effectively final) via documentation or lack of export to prevent harmful inheritance.

### 4.3 Liskov Substitution Principle (LSP)
- **Rule:** Any implementation of `IEquatable<T>` **MUST** adhere to the structural equality contract.
- **Enforcement:** If `A.Equals(B)` is true, then `A.GetHashCode()` **MUST** equal `B.GetHashCode()`.

### 4.4 Interface Segregation Principle (ISP)
- **Rule:** Interfaces **MUST** be granular.
- **Example:** Do not force `ICloneable` onto a type that only needs `IEquatable`.

### 4.5 Dependency Inversion Principle (DIP)
- **Rule:** High-level policy (e.g., generic collections) **MUST NOT** depend on low-level detail (e.g., specific string implementations). They **MUST** depend on abstractions (`IComparable<T>`).

---

## 5. Canonical Worktree Structure

The project file structure **MUST** strictly adhere to this layout. Any deviation is an architectural violation.

```
src/
├── Domain/                         # CONCEPTUAL CONTRACTS (Inner Ring)
│   ├── Abstractions/               # Pure Interfaces (IComparable<T>, IDisposable)
│   │   └── DependencyInjection/    # DI Interfaces (IServiceProvider)
│   └── Concepts/                   # Conceptual Enums (ServiceLifetime)
│
├── System/                         # RUNTIME IMPLEMENTATION (Outer Ring)
│   ├── Types/                      # Fundamental Types (CsString, CsInt32)
│   ├── Collections/                # Generic Collections (List<T>)
│   ├── Text/                       # Text Processing (StringBuilder)
│   ├── IO/                         # Input/Output (Stream, Console)
│   ├── Runtime/                    # Runtime Services
│   └── DependencyInjection/        # DI Implementation (ServiceCollection)
│
└── index.ts                        # Main Entry Point (Barrel File)
```

### 5.1 Placement Validation (Right vs. Wrong)

| Category | Item Name | Correct Location ✅ | Incorrect Location ❌ | Why? |
| :--- | :--- | :--- | :--- | :--- |
| **Primitive Type** | `CsString` | `src/System/Types` | `src/Domain/ValueObjects` | It is a concrete runtime implementation. |
| **Logic/Algo** | `Sort()` | `src/System/Linq` | `src/Domain/Logic` | Domain logic cannot contain implementation. |
| **DI Interface** | `IServiceProvider` | `src/Domain/Abstractions/DependencyInjection` | `src/System/DependencyInjection` | Implementation details depend on Abstractions. |
| **DI Impl** | `ServiceCollection` | `src/System/DependencyInjection` | `src/Domain/DependencyInjection` | Helper/Container logic is not a domain concept. |
| **DI DTO** | `ServiceDescriptor` | `src/Domain/Abstractions/DependencyInjection` | `src/System` | Descriptors are part of the contract definition. |

---

## 6. Implementation Rules (Recap)

1. **Primitive Prohibition:** Public APIs **MUST NOT** expose JS primitives (`string`, `number`).
2. **Immutability:** System Types **MUST** be immutable (`Object.freeze`).
3. **Factories:** Public constructors are **FORBIDDEN** for System Types. Use `From()`.
4. **No Escape:** `any`, `require`, `@ts-ignore` are **PROHIBITED**.

---

## 7. Dependency Injection Strategy

Dependency Injection (DI) allows loosely coupled runtime composition while adhering to Clean Architecture.

### 7.1 Separation of Concerns
The DI system is split into **Contract** and **Implementation**.

#### 7.1.1 The Domain Contract (`src/Domain`)
- **MUST** define the `IServiceProvider` and `IServiceScope` interfaces.
- **MUST** define definitions like `ServiceLifetime` enum.
- **MUST** define the `ServiceDescriptor` structure (as a DTO) if it contains no logic.
- **MUST NOT** import any implementation classes.

#### 7.1.2 The System Implementation (`src/System`)
- **MUST** implement the Container logic (`ServiceCollection`, `ServiceProvider`).
- **MUST** handle the storage and lifecycle management of services.
- **MAY** instantiate concrete System types.

### 7.2 Usage Rules
- **Domain Objects:** **MUST NOT** depend on `ServiceProvider` (concrete). They MAY depend on `IServiceProvider` (interface).
- **System Objects:** MAY use `ServiceCollection` to compose the runtime environment.
- **Zero-Coupling:** The `System` layer provides the DI capability, but strictly implements the `Domain` interfaces. Current `ServiceDescriptor` in Domain is **ALLOWED** as long as it remains a logic-free definition.
