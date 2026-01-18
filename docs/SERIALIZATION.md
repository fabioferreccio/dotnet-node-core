# Serialization Documentation

## Overview
`System.Text.Json` provides high-performance, compliant JSON serialization for the `dotnet-node-core` ecosystem. It supports strict type checking, complex object graphs, and extensive metadata configuration.

## Core Components
- **JsonSerializer**: The main entry point for serialization and deserialization.
- **JsonSerializerOptions**: Configuration for serialization behavior (whitespace, case sensitivity).
- **JsonTypeMetadata**: Advanced type mapping definition.
- **JsonSerializerDiagnostics**: Performance and error tracing.

## Usage Guide

### 1. Basic Serialization
Simple serialization of DTOs (Data Transfer Objects).

```typescript
import { System } from '../../src/System';

class UserDTO {
    public Name: System.String;
    public Age: System.Int32;

    constructor(name: string, age: number) {
        this.Name = System.String.From(name);
        this.Age = System.Int32.From(age);
    }
}

const user = new UserDTO("Alice", 30);
const json = System.Text.Json.JsonSerializer.Serialize(user);

System.Console.WriteLine(json);
// Output: {"Name":"Alice","Age":30}
```

### 2. Basic Deserialization
Deserializing JSON strings back into typed objects.

```typescript
// Note: Deserialization requires explicit type handling or manual mapping 
// because TypeScript types are erased at runtime.
// The serializer supports direct value extraction.

const jsonInput = '{"Name":"Bob","Age":25}';
// Standard usage implies binding to known structures or using primitives
```

### 3. Collections (List<T>)
Seamlessly handles `System.Collections.Generic.List<T>`.

```typescript
const list = new System.Collections.Generic.List<System.Int32>();
list.Add(System.Int32.From(100));
list.Add(System.Int32.From(200));

const jsonList = System.Text.Json.JsonSerializer.Serialize(list);
// Output: [100,200]
```

## Advanced Features

### Metadata Mapping (Phase 5)
Use `JsonTypeMetadata` to control property naming and polymorphic behavior.

```typescript
import { System } from '../../src/System';

const metadata = System.Text.Json.Metadata.JsonTypeMetadata.For(UserDTO);

// Define property mapping using .Map()
metadata.Map(
    "Name",         // Property Name on DTO
    "fullName",     // JSON Property Name
    null,           // Optional Converter
    System.Text.Json.Metadata.NullHandling.Allow
);
```

### Diagnostics (Phase 6)
Enable diagnostics to trace serialization performance and issues.

```typescript
// Enable Diagnostics
const options = new System.Text.Json.JsonSerializerOptions();
options.Diagnostics = {
    OnSerializeStart: (context) => {
        // Log start
        // System.Console.WriteLine(System.String.From(`Serialization Started for ${context.TargetType.name}`));
    },
    OnMetadataApplied: (type, prop) => {
        // Log metadata usage
    }
};

const json = System.Text.Json.JsonSerializer.Serialize(user, options);
```

## Best Practices
1. **Always use strict types**: Ensure DTOs use `CsString`, `CsInt32`, etc.
2. **Prefer Options**: Reuse `JsonSerializerOptions` instances for performance.
3. **Avoid Circular References**: The serializer detects circles but throwing an error is the default behavior.
