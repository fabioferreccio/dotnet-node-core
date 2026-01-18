# Dependency Injection Documentation

## Overview
`System.DependencyInjection` implements a strict Inversion of Control (IoC) container based on the Microsoft.Extensions.DependencyInjection specification. It supports Singleton, Scoped, and Transient lifetimes.

## Core Concepts
- **ServiceCollection**: The builder used to register services.
- **ServiceProvider**: The container that resolves services.
- **ServiceLifetime**: Defines how long a service instance lives.
    - `Singleton`: Created once per root provider.
    - `Scoped`: Created once per scope.
    - `Transient`: Created every time it is requested.

## Usage Guide

### 1. Basic Registration & Resolution

```typescript
import { System } from '../../src/System';

// 1. Define Service
class DatabaseService {
    public Connect(): System.String {
        return System.String.From("Connected");
    }
}

// 2. Register
const services = new System.DependencyInjection.ServiceCollection();
services.AddSingleton(DatabaseService);

// 3. Build
const provider = services.BuildServiceProvider();

// 4. Resolve
const db = provider.GetService(DatabaseService);
System.Console.WriteLine(db.Connect());
```

### 2. Interface based Resolution (Self-Binding)
While TypeScript interfaces are erased, you can use abstract classes or string tokens.

```typescript
abstract class ILogger {
    abstract Log(message: System.String): void;
}

class ConsoleLogger extends ILogger {
    public Log(message: System.String): void {
        System.Console.WriteLine(message);
    }
}

const services = new System.DependencyInjection.ServiceCollection();
// Register Implementation against Abstraction
services.AddSingleton(ILogger, new ConsoleLogger());
```

### 3. Factory Registration
Use factories for complex initialization logic.

```typescript
services.AddTransient(DatabaseService, (provider) => {
    const config = provider.GetService(Configuration);
    return new DatabaseService(config.ConnectionString);
});
```

### 4. Scoped Services
Scopes are essential for request-based lifecycles (e.g., HTTP requests).

```typescript
const services = new System.DependencyInjection.ServiceCollection();
services.AddScoped(RequestContext);

const rootProvider = services.BuildServiceProvider();

// Create a Scope
const scope = rootProvider.CreateScope();
const context = scope.ServiceProvider.GetService(RequestContext);

// Dispose scope at end of request
scope.Dispose();
```

## Rules & Constraints
1. **Self-Binding**: Classes register as themselves by default.
2. **Circular Dependencies**: The container detects and throws on circular dependencies.
3. **Disposal**: `ServiceProvider` calls `Dispose()` on services implementing `IDisposable` when the scope is disposed.
