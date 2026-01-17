import { IServiceCollection, IServiceProvider } from "../../Domain/Interfaces";
import {
    ServiceDescriptor,
    ServiceIdentifier,
    ImplementationFactory,
    Constructor,
    SelfBindingFactory,
    ServiceLifetime,
} from "../../Domain/DependencyInjection";
import { ServiceProvider } from "./ServiceProvider";
import { CsBoolean } from "../../System/Types";

export class ServiceCollection extends Array<ServiceDescriptor> implements IServiceCollection {
    // Explicitly implementing the Add method since Array.prototype.push exists but signature differs slightly in logic usage (we return this).
    public Add(descriptor: ServiceDescriptor): IServiceCollection {
        this.push(descriptor);
        return this;
    }

    // Singleton
    public AddSingleton<T>(serviceType: Constructor<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;
    public AddSingleton(serviceType: ServiceIdentifier, arg2?: unknown): IServiceCollection {
        this.Add(ServiceDescriptor.Describe(serviceType, ServiceLifetime.Singleton, arg2));
        return this;
    }

    // Scoped
    public AddScoped<T>(serviceType: Constructor<T>): IServiceCollection;
    public AddScoped<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): IServiceCollection;
    public AddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    public AddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddScoped(serviceType: ServiceIdentifier, arg2?: unknown): IServiceCollection {
        this.Add(ServiceDescriptor.Describe(serviceType, ServiceLifetime.Scoped, arg2));
        return this;
    }

    // Transient
    public AddTransient<T>(serviceType: Constructor<T>): IServiceCollection;
    public AddTransient<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): IServiceCollection;
    public AddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    public AddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddTransient(serviceType: ServiceIdentifier, arg2?: unknown): IServiceCollection {
        this.Add(ServiceDescriptor.Describe(serviceType, ServiceLifetime.Transient, arg2));
        return this;
    }

    // TryAdd Singleton
    public TryAddSingleton<T>(serviceType: Constructor<T>): CsBoolean;
    public TryAddSingleton<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): CsBoolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;
    public TryAddSingleton(serviceType: ServiceIdentifier, arg2?: unknown): CsBoolean {
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return CsBoolean.From(false);

        this.Add(ServiceDescriptor.Describe(serviceType, ServiceLifetime.Singleton, arg2));
        return CsBoolean.From(true);
    }

    // TryAdd Scoped
    public TryAddScoped<T>(serviceType: Constructor<T>): CsBoolean;
    public TryAddScoped<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): CsBoolean;
    public TryAddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    public TryAddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    public TryAddScoped(serviceType: ServiceIdentifier, arg2?: unknown): CsBoolean {
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return CsBoolean.From(false);

        this.Add(ServiceDescriptor.Describe(serviceType, ServiceLifetime.Scoped, arg2));
        return CsBoolean.From(true);
    }

    // TryAdd Transient
    public TryAddTransient<T>(serviceType: Constructor<T>): CsBoolean;
    public TryAddTransient<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): CsBoolean;
    public TryAddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    public TryAddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    public TryAddTransient(serviceType: ServiceIdentifier, arg2?: unknown): CsBoolean {
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return CsBoolean.From(false);

        this.Add(ServiceDescriptor.Describe(serviceType, ServiceLifetime.Transient, arg2));
        return CsBoolean.From(true);
    }

    public TryAdd(descriptor: ServiceDescriptor): CsBoolean {
        const exists = this.some((d) => d.ServiceType === descriptor.ServiceType);
        if (exists) return CsBoolean.From(false);

        this.Add(descriptor);
        return CsBoolean.From(true);
    }

    public BuildServiceProvider(): IServiceProvider {
        // Convert list to Map for cleaner lookup O(1)
        const map = new Map<ServiceIdentifier, ServiceDescriptor>();
        for (const desc of this) {
            // Last registration wins usually? Or first?
            // MS DI: Last wins for resolution of single, but IEnumerable resolves all.
            // For simple GetService, we usually allow overwriting in the map.
            map.set(desc.ServiceType, desc);
        }
        return new ServiceProvider(map);
    }
}
