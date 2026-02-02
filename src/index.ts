// Side-effect wiring for Registries (Enumerable, etc.)
import "./System/index";

// Core System Exports
export * from "./System";
export * from "./System/Types";

// Primary Namespaces
export * from "./System/IO";
export * from "./System/Linq";
export { ServiceCollection, ServiceProvider, ServiceScope } from "./System/DependencyInjection";
export {
    ServiceDescriptor,
    ServiceLifetime,
    ServiceIdentifier,
    Injectable,
    Inject,
    ImplementationFactory,
    SelfBindingFactory,
} from "./Domain/DependencyInjection";
export {
    IServiceProvider,
    IServiceCollection,
    IServiceScope,
    IServiceScopeFactory,
    IDisposable,
    IAsyncDisposable,
} from "./Domain/Interfaces";
export { JsonConverter, JsonSerializer, JsonSerializerOptions } from "./System/Text/Json";
export * from "./System/Net/Http";
export * from "./System/Net/Http";
export { AnsiConsole } from "./System/Console/AnsiConsole";
export { Color } from "./System/Console/Color";
export { Rule } from "./System/Console/Rule";
export { Panel } from "./System/Console/Panel";
export { Table } from "./System/Console/Table";


// Collections (Explicit exports due to missing index)
export * from "./System/Collections/Generic/List";
export * from "./System/Collections/Generic/Dictionary";

// Exception (Re-export from definition)
export { Exception } from "./Domain/SeedWork/Exception";
