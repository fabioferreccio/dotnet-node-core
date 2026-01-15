import { IServiceCollection, IServiceProvider } from "../../Domain/Interfaces";
import {
    ServiceDescriptor,
    ServiceIdentifier,
    ImplementationFactory,
    ServiceLifetime,
} from "../../Domain/DependencyInjection";
import { ServiceProvider } from "./ServiceProvider";

export class ServiceCollection extends Array<ServiceDescriptor> implements IServiceCollection {
    // Explicitly implementing the Add method since Array.prototype.push exists but signature differs slightly in logic usage (we return this).
    public Add(descriptor: ServiceDescriptor): IServiceCollection {
        this.push(descriptor);
        return this;
    }

    public AddSingleton<T>(
        serviceType: ServiceIdentifier<T>,
        implementation: { new (...args: any[]): T },
    ): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): IServiceCollection;
    public AddSingleton(serviceType: any, implOrFactoryOrInstance: any): IServiceCollection {
        this.Add(ServiceDescriptor.Singleton(serviceType, implOrFactoryOrInstance));
        return this;
    }

    public AddScoped<T>(
        serviceType: ServiceIdentifier<T>,
        implementation: { new (...args: any[]): T },
    ): IServiceCollection;
    public AddScoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddScoped(serviceType: any, implOrFactory: any): IServiceCollection {
        this.Add(ServiceDescriptor.Scoped(serviceType, implOrFactory));
        return this;
    }

    public AddTransient<T>(
        serviceType: ServiceIdentifier<T>,
        implementation: { new (...args: any[]): T },
    ): IServiceCollection;
    public AddTransient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): IServiceCollection;
    public AddTransient(serviceType: any, implOrFactory: any): IServiceCollection {
        this.Add(ServiceDescriptor.Transient(serviceType, implOrFactory));
        return this;
    }

    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, implementation: { new (...args: any[]): T }): boolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): boolean;
    public TryAddSingleton<T>(serviceType: ServiceIdentifier<T>, instance: T): boolean;
    public TryAddSingleton(serviceType: any, implOrFactoryOrInstance: any): boolean {
        // Check if exists
        const exists = this.some((d) => d.ServiceType === serviceType);
        if (exists) return false;

        this.AddSingleton(serviceType, implOrFactoryOrInstance);
        return true;
    }

    // TODO: Implement TryAddScoped, TryAddTransient if needed or generic TryAdd

    public BuildServiceProvider(): IServiceProvider {
        // Convert list to Map for cleaner lookup O(1)
        const map = new Map<any, ServiceDescriptor>();
        for (const desc of this) {
            // Last registration wins usually? Or first?
            // MS DI: Last wins for resolution of single, but IEnumerable resolves all.
            // For simple GetService, we usually allow overwriting in the map.
            map.set(desc.ServiceType, desc);
        }
        return new ServiceProvider(map);
    }
}
