import { IServiceCollection, IServiceProvider } from "../../Domain/Interfaces";
import {
    ServiceDescriptor,
    ServiceIdentifier,
    ImplementationFactory,
    Constructor,
} from "../../Domain/DependencyInjection";
import { ServiceProvider } from "./ServiceProvider";
import { CsBoolean } from "../../System/Types";

export class ServiceCollection extends Array<ServiceDescriptor> implements IServiceCollection {
    // Explicitly implementing the Add method since Array.prototype.push exists but signature differs slightly in logic usage (we return this).
    public Add(descriptor: ServiceDescriptor): IServiceCollection {
        this.push(descriptor);
        return this;
    }

    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;
    public AddSingleton(serviceType: ServiceIdentifier, implOrFactoryOrInstance: unknown): IServiceCollection {
        // ServiceDescriptor accepts 'any' which covers 'unknown'.
        this.Add(ServiceDescriptor.Singleton(serviceType, implOrFactoryOrInstance));
        return this;
    }

    public AddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    public AddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddScoped<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;
    public AddScoped(serviceType: ServiceIdentifier, implOrFactory: unknown): IServiceCollection {
        this.Add(ServiceDescriptor.Scoped(serviceType, implOrFactory));
        return this;
    }

    public AddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): IServiceCollection;
    public AddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddTransient<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;
    public AddTransient(serviceType: ServiceIdentifier, implOrFactory: unknown): IServiceCollection {
        this.Add(ServiceDescriptor.Transient(serviceType, implOrFactory));
        return this;
    }

    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;
    public TryAddSingleton(serviceType: ServiceIdentifier, implOrFactoryOrInstance: unknown): CsBoolean {
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return CsBoolean.From(false);

        this.AddSingleton(serviceType, implOrFactoryOrInstance);
        return CsBoolean.From(true);
    }

    public TryAddScoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    public TryAddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    public TryAddScoped<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;
    public TryAddScoped(serviceType: ServiceIdentifier, implOrFactory: unknown): CsBoolean {
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return CsBoolean.From(false);

        this.AddScoped(serviceType, implOrFactory);
        return CsBoolean.From(true);
    }

    public TryAddTransient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): CsBoolean;
    public TryAddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): CsBoolean;
    public TryAddTransient<T>(serviceType: ServiceIdentifier<T>, instance: T): CsBoolean;
    public TryAddTransient(serviceType: ServiceIdentifier, implOrFactory: unknown): CsBoolean {
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return CsBoolean.From(false);

        this.AddTransient(serviceType, implOrFactory);
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
