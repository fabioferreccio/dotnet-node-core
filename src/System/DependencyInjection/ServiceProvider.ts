import "reflect-metadata";
import {
    IServiceProvider,
    IServiceScope,
    IServiceScopeFactory,
    IDisposable,
    IAsyncDisposable,
} from "../../Domain/Interfaces";
import { Task } from "../../Domain/Threading/Tasks/Task";
import {
    ServiceDescriptor,
    ServiceLifetime,
    ServiceIdentifier,
    INJECT_METADATA_KEY,
} from "../../Domain/DependencyInjection";
import { ServiceScope } from "./ServiceScope";

export class ServiceProvider
    implements IServiceProvider, IServiceScope, IServiceScopeFactory, IDisposable, IAsyncDisposable
{
    private readonly _descriptors: Map<ServiceIdentifier, ServiceDescriptor>;
    private readonly _singletons: Map<ServiceIdentifier, unknown>;
    private readonly _scopedInstances: Map<ServiceIdentifier, unknown>;
    private readonly _root: ServiceProvider;
    private _isDisposed = false;

    private constructor(descriptors: Map<ServiceIdentifier, ServiceDescriptor>);
    private constructor(descriptors: Map<ServiceIdentifier, ServiceDescriptor>, root: ServiceProvider);
    private constructor(descriptors: Map<ServiceIdentifier, ServiceDescriptor>, root?: ServiceProvider) {
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

    /**
     * Internal factory for creating a ServiceProvider instance.
     * Required by Rule 6: Strict Construction Rule.
     */
    public static Create(descriptors: Map<ServiceIdentifier, ServiceDescriptor>): ServiceProvider {
        return new ServiceProvider(descriptors);
    }

    // --- IServiceScope Implementation ---

    public get ServiceProvider(): IServiceProvider {
        return this;
    }

    public Dispose(): void {
        if (this._isDisposed) return;
        this._isDisposed = true;

        // Dispose Scoped Instances
        this.DisposeMap(this._scopedInstances);
        this._scopedInstances.clear();

        // Dispose Singletons ONLY if we are the root
        if (this._root === this) {
            this.DisposeMap(this._singletons);
            this._singletons.clear();
        }
    }

    private DisposeMap(map: Map<ServiceIdentifier, unknown>): void {
        for (const instance of map.values()) {
            this.DisposeInstance(instance);
        }
    }

    private DisposeInstance(instance: unknown): void {
        if (instance && typeof (instance as IDisposable).Dispose === "function") {
            try {
                (instance as IDisposable).Dispose();
            } catch {
                // Ignore disposal errors
            }
        }
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
        return ServiceScope.Create(scopedProvider);
    }

    private CreateInstance(descriptor: ServiceDescriptor): unknown {
        // A. Instance
        if (descriptor.ImplementationInstance !== undefined) {
            return descriptor.ImplementationInstance;
        }

        // B. Factory
        if (descriptor.ImplementationFactory) {
            return descriptor.ImplementationFactory(this);
        }

        // C. Implementation Type (Auto-Resolution)
        if (descriptor.ImplementationType) {
            const Ctor = descriptor.ImplementationType as new (...args: unknown[]) => unknown;

            // 1. Check for Design-Time Metadata (emitDecoratorMetadata)
            const paramTypes = Reflect.getMetadata("design:paramtypes", Ctor) || [];

            // 2. Check for Manual Injections (@Inject)
            const manualInjections: Record<number, unknown> = Reflect.getOwnMetadata(INJECT_METADATA_KEY, Ctor) || {};

            if (paramTypes.length > 0 || Object.keys(manualInjections).length > 0) {
                // Auto-Resolve Dependencies
                const args = paramTypes.map((paramType: unknown, index: number) => {
                    // Highest priority: @Inject token
                    const manualToken = manualInjections[index];
                    if (manualToken !== undefined) {
                        return this.GetRequiredService(manualToken as ServiceIdentifier);
                    }

                    // Fallback: captured paramType
                    if (paramType === Object) {
                        console.warn(
                            `[DI Warning]: Dependency at index ${index} of ${Ctor.name} resolved as 'Object'. ` +
                                `This usually happens due to TypeScript interface erasure. ` +
                                `Consider using @Inject("Token") to resolve this dependency.`,
                        );
                    }

                    return this.GetRequiredService(paramType as ServiceIdentifier);
                });
                return new Ctor(...args);
            }

            // 3. Fallback: Parameterless Constructor
            return new Ctor();
        }

        throw new Error(`Invalid ServiceDescriptor for ${String(descriptor.ServiceType)}. No implementation found.`);
    }
}
