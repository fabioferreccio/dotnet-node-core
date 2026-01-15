import { IServiceProvider, IServiceScope, IServiceScopeFactory, IDisposable } from "../../Domain/Interfaces";
import { ServiceDescriptor, ServiceLifetime } from "../../Domain/DependencyInjection";
import { ServiceScope } from "./ServiceScope";

export class ServiceProvider implements IServiceProvider, IServiceScope, IServiceScopeFactory, IDisposable {
    private readonly _descriptors: Map<any, ServiceDescriptor>;
    private readonly _singletons: Map<any, any>;
    private readonly _scopedInstances: Map<any, any>;
    private readonly _root: ServiceProvider;
    private _isDisposed: boolean = false;

    constructor(descriptors: Map<any, ServiceDescriptor>);
    constructor(descriptors: Map<any, ServiceDescriptor>, root: ServiceProvider);
    constructor(descriptors: Map<any, ServiceDescriptor>, root?: ServiceProvider) {
        this._descriptors = descriptors;

        if (root) {
            // Scoped Provider
            this._root = root;
            this._singletons = root._singletons; // Share singletons
            this._scopedInstances = new Map<any, any>();
        } else {
            // Root Provider
            this._root = this;
            this._singletons = new Map<any, any>();
            this._scopedInstances = new Map<any, any>(); // Root scope
        }
    }

    // --- IServiceScope Implementation ---

    public get ServiceProvider(): IServiceProvider {
        return this;
    }

    public Dispose(): void {
        this._isDisposed = true;
        this._scopedInstances.clear();
        // We do not dispose descriptors or singletons generally, unless we implement specific disposal logic for IDisposable services.
        // For simplicity in v0.3, we just mark as disposed and clear references.
    }

    // --- IServiceProvider Implementation ---

    public GetService<T>(serviceIdentifier: any): T | null {
        if (this._isDisposed) {
            throw new Error("Cannot access a disposed object (ServiceProvider).");
        }

        const descriptor = this._descriptors.get(serviceIdentifier);
        if (!descriptor) {
            return null;
        }

        // 1. Singleton
        if (descriptor.Lifetime === ServiceLifetime.Singleton) {
            // Access Cache from Root
            if (this._singletons.has(serviceIdentifier)) {
                return this._singletons.get(serviceIdentifier);
            }
            // Create and Cache
            const instance = this.CreateInstance(descriptor);
            this._singletons.set(serviceIdentifier, instance);
            return instance;
        }

        // 2. Scoped
        if (descriptor.Lifetime === ServiceLifetime.Scoped) {
            if (this._scopedInstances.has(serviceIdentifier)) {
                return this._scopedInstances.get(serviceIdentifier);
            }
            const instance = this.CreateInstance(descriptor);
            this._scopedInstances.set(serviceIdentifier, instance);
            return instance;
        }

        // 3. Transient
        return this.CreateInstance(descriptor);
    }

    public GetRequiredService<T>(serviceIdentifier: any): T {
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
    private CreateInstance(descriptor: ServiceDescriptor): any {
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
            return new descriptor.ImplementationType();
        }

        throw new Error(`Invalid ServiceDescriptor for ${String(descriptor.ServiceType)}. No implementation found.`);
    }
}
