import { IServiceProvider } from "../Interfaces";

export enum ServiceLifetime {
    Singleton = 0,
    Scoped = 1,
    Transient = 2,
}

export type Constructor<T = unknown> = new (...args: unknown[]) => T;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ServiceIdentifier<T = unknown> = string | symbol | Constructor<T> | Function;
export type ImplementationFactory<T = unknown> = (provider: IServiceProvider) => T;

export class ServiceDescriptor {
    public readonly ServiceType: ServiceIdentifier;
    public readonly ImplementationType?: Constructor<unknown>;
    public readonly ImplementationInstance?: unknown;
    public readonly ImplementationFactory?: ImplementationFactory;
    public readonly Lifetime: ServiceLifetime;

    constructor(
        serviceType: ServiceIdentifier,
        lifetime: ServiceLifetime,
        implementationType?: Constructor<unknown>,
        implementationInstance?: unknown,
        factory?: ImplementationFactory,
    ) {
        this.ServiceType = serviceType;
        this.Lifetime = lifetime;
        this.ImplementationType = implementationType;
        this.ImplementationInstance = implementationInstance;
        this.ImplementationFactory = factory;
    }

    public static Singleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): ServiceDescriptor;
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, instance: T): ServiceDescriptor;
    public static Singleton(
        serviceType: ServiceIdentifier,
        implementationOrInstanceOrFactory: unknown,
    ): ServiceDescriptor;
    public static Singleton(
        serviceType: ServiceIdentifier,
        implementationOrInstanceOrFactory: unknown,
    ): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, implementationOrInstanceOrFactory, ServiceLifetime.Singleton);
    }

    public static Scoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): ServiceDescriptor;
    public static Scoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Scoped(serviceType: ServiceIdentifier, implementationOrFactory: unknown): ServiceDescriptor;
    public static Scoped(serviceType: ServiceIdentifier, implementationOrFactory: unknown): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, implementationOrFactory, ServiceLifetime.Scoped);
    }

    public static Transient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): ServiceDescriptor;
    public static Transient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Transient(serviceType: ServiceIdentifier, implementationOrFactory: unknown): ServiceDescriptor;
    public static Transient(serviceType: ServiceIdentifier, implementationOrFactory: unknown): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, implementationOrFactory, ServiceLifetime.Transient);
    }

    private static Describe(
        serviceType: ServiceIdentifier,
        implementationOrInstanceOrFactory: unknown,
        lifetime: ServiceLifetime,
    ): ServiceDescriptor {
        let implementationType: Constructor<unknown> | undefined;
        let implementationInstance: unknown | undefined;
        let implementationFactory: ImplementationFactory | undefined;

        if (typeof implementationOrInstanceOrFactory === "function") {
            // Could be class (constructor) or factory function
            if (ServiceDescriptor.IsConstructor(implementationOrInstanceOrFactory)) {
                implementationType = implementationOrInstanceOrFactory as Constructor<unknown>;
            } else {
                implementationFactory = implementationOrInstanceOrFactory as ImplementationFactory;
            }
        } else {
            implementationInstance = implementationOrInstanceOrFactory;
        }

        return new ServiceDescriptor(
            serviceType,
            lifetime,
            implementationType,
            implementationInstance,
            implementationFactory,
        );
    }

    // Helper to distinguish Class from Function
    private static IsConstructor(func: unknown): boolean {
        if (!func || typeof func !== "function") return false;
        const str = func.toString();
        if (str.startsWith("class ")) return true;
        return false;
    }
}
