import { IServiceProvider, IServiceScope, IServiceScopeFactory, IDisposable, IAsyncDisposable } from "../../Domain/Interfaces";
import { Task } from "../../Domain/Threading/Tasks/Task";
import { ServiceDescriptor, ServiceLifetime, ServiceIdentifier } from "../../Domain/DependencyInjection";
import { ServiceScope } from "./ServiceScope";

export class ServiceProvider implements IServiceProvider, IServiceScope, IServiceScopeFactory, IDisposable, IAsyncDisposable {
    private readonly _descriptors: Map<ServiceIdentifier, ServiceDescriptor>;
    private readonly _singletons: Map<ServiceIdentifier, unknown>;
    private readonly _scopedInstances: Map<ServiceIdentifier, unknown>;
    private readonly _root: ServiceProvider;
    private _isDisposed = false;

    constructor(descriptors: Map<ServiceIdentifier, ServiceDescriptor>);
    constructor(descriptors: Map<ServiceIdentifier, ServiceDescriptor>, root: ServiceProvider);
    constructor(descriptors: Map<ServiceIdentifier, ServiceDescriptor>, root?: ServiceProvider) {
        this._descriptors = descriptors;

        if (root) {
            // Scoped Provider
            this._root = root;
            this._singletons = root._singletons; // Share singletons
            this._scopedInstances = new Map<ServiceIdentifier, unknown>();
        } else {
            // Root Provider
            this._root = this;
            this._singletons = new Map<ServiceIdentifier, unknown>();
            this._scopedInstances = new Map<ServiceIdentifier, unknown>(); // Root scope
        }
    }

    // --- IServiceScope Implementation ---

    public get ServiceProvider(): IServiceProvider {
        return this;
    }

    public Dispose(): void {
        this._isDisposed = true;
        this._scopedInstances.clear();
    }

    public [Symbol.dispose](): void {
        this.Dispose();
    }

    public async DisposeAsync(): Task<void> {
        // Future: specific async disposal logic for scoped instances if needed
        this.Dispose();
        return Promise.resolve();
    }

    public async [Symbol.asyncDispose](): Task<void> {
        await this.DisposeAsync();
    }

    // --- IServiceProvider Implementation ---

    public GetService<T>(serviceIdentifier: ServiceIdentifier<T>): T | null {
        if (this._isDisposed) {
            throw new Error("Cannot access a disposed object (ServiceProvider).");
        }

        const descriptor = this._descriptors.get(serviceIdentifier as ServiceIdentifier);
        if (!descriptor) {
            return null;
        }

        // 1. Singleton
        if (descriptor.Lifetime === ServiceLifetime.Singleton) {
            // Access Cache from Root
            if (this._singletons.has(serviceIdentifier as ServiceIdentifier)) {
                return this._singletons.get(serviceIdentifier as ServiceIdentifier) as T;
            }
            // Create and Cache
            const instance = this.CreateInstance(descriptor);
            this._singletons.set(serviceIdentifier as ServiceIdentifier, instance);
            return instance as T;
        }

        // 2. Scoped
        if (descriptor.Lifetime === ServiceLifetime.Scoped) {
            if (this._scopedInstances.has(serviceIdentifier as ServiceIdentifier)) {
                return this._scopedInstances.get(serviceIdentifier as ServiceIdentifier) as T;
            }
            const instance = this.CreateInstance(descriptor);
            this._scopedInstances.set(serviceIdentifier as ServiceIdentifier, instance);
            return instance as T;
        }

        // 3. Transient
        const transient = this.CreateInstance(descriptor);
        return transient as T;
    }

    public GetRequiredService<T>(serviceIdentifier: ServiceIdentifier<T>): T {
        const service = this.GetService<T>(serviceIdentifier);
        if (service === null) {
            throw new Error(`No service for type '${String(serviceIdentifier)}' has been registered.`);
        }
        return service;
    }

    public CreateScope(): IServiceScope {
        // Create a new ServiceProvider that shares the same root (singletons) but has a new scoped cache.
        const scopedProvider = new ServiceProvider(this._descriptors, this._root);
        return new ServiceScope(scopedProvider);
    }

    // ... CreateInstance Logic ...
    private CreateInstance(descriptor: ServiceDescriptor): unknown {
        // A. Instance
        if (descriptor.ImplementationInstance !== undefined) {
            return descriptor.ImplementationInstance;
        }

        // B. Factory
        if (descriptor.ImplementationFactory) {
            return descriptor.ImplementationFactory(this);
        }

        // C. Implementation Type
        if (descriptor.ImplementationType) {
            // Safe constructor invocation without any.
            // descriptor.ImplementationType is Constructor<T>.
            // We can invoke with new.
            // TypeScript might object if it thinks arguments are missing, but strict assumption for DI is parameterless or handled (here parameterless logic or loose).
            // Actually, we are NOT injecting dependencies here? 'new descriptor.ImplementationType()'.
            // In a real DI, we recursively resolve arguments. v0.3 is simplified.
            // Type assertions: 'as new () => unknown' covers parameterless.
            const Ctor = descriptor.ImplementationType as new (...args: unknown[]) => unknown;
            return new Ctor();
        }

        throw new Error(`Invalid ServiceDescriptor for ${String(descriptor.ServiceType)}. No implementation found.`);
    }
}
