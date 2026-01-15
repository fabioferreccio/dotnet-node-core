import { IServiceProvider } from "../Interfaces";

export enum ServiceLifetime {
    Singleton = 0,
    Scoped = 1,
    Transient = 2,
}

export type ServiceIdentifier<T = any> = string | symbol | { new (...args: any[]): T } | Function;
export type ImplementationFactory<T = any> = (provider: IServiceProvider) => T;

export class ServiceDescriptor {
    public readonly ServiceType: ServiceIdentifier;
    public readonly ImplementationType?: { new (...args: any[]): any };
    public readonly ImplementationInstance?: any;
    public readonly ImplementationFactory?: ImplementationFactory;
    public readonly Lifetime: ServiceLifetime;

    constructor(
        serviceType: ServiceIdentifier,
        lifetime: ServiceLifetime,
        implementationType?: { new (...args: any[]): any },
        implementationInstance?: any,
        factory?: ImplementationFactory,
    ) {
        this.ServiceType = serviceType;
        this.Lifetime = lifetime;
        this.ImplementationType = implementationType;
        this.ImplementationInstance = implementationInstance;
        this.ImplementationFactory = factory;
    }

    public static Singleton<T>(
        serviceType: ServiceIdentifier<T>,
        implementation: { new (...args: any[]): T },
    ): ServiceDescriptor;
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, instance: T): ServiceDescriptor;
    public static Singleton(serviceType: ServiceIdentifier, implementationOrInstanceOrFactory: any): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, implementationOrInstanceOrFactory, ServiceLifetime.Singleton);
    }

    public static Scoped<T>(
        serviceType: ServiceIdentifier<T>,
        implementation: { new (...args: any[]): T },
    ): ServiceDescriptor;
    public static Scoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Scoped(serviceType: ServiceIdentifier, implementationOrFactory: any): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, implementationOrFactory, ServiceLifetime.Scoped);
    }

    public static Transient<T>(
        serviceType: ServiceIdentifier<T>,
        implementation: { new (...args: any[]): T },
    ): ServiceDescriptor;
    public static Transient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Transient(serviceType: ServiceIdentifier, implementationOrFactory: any): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, implementationOrFactory, ServiceLifetime.Transient);
    }

    private static Describe(
        serviceType: ServiceIdentifier,
        implementationOrInstanceOrFactory: any,
        lifetime: ServiceLifetime,
    ): ServiceDescriptor {
        let implementationType: { new (...args: any[]): any } | undefined;
        let implementationInstance: any | undefined;
        let implementationFactory: ImplementationFactory | undefined;

        if (typeof implementationOrInstanceOrFactory === "function") {
            // Could be class (constructor) or factory function
            // A crude heuristic: Classes usually start with uppercase, or have prototype?
            // Safer to assume Constructor if it has no prototype methods?
            // Actually, in JS/TS dependency injection, clearer separation is better.
            // But mimicking .NET:
            // "AddSingleton<ISvc, Svc>()" -> Type
            // "AddSingleton(x => ...)" -> Factory

            // We'll rely on a simple check: does it look like a constructor?
            // If it's an arrow function, it's a factory.
            // If it's a class, it's a type.

            if (ServiceDescriptor.IsConstructor(implementationOrInstanceOrFactory)) {
                implementationType = implementationOrInstanceOrFactory;
            } else {
                implementationFactory = implementationOrInstanceOrFactory;
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
    private static IsConstructor(func: any): boolean {
        // If it has a prototype with property descriptors other than constructor, it's likely a class.
        // Or if it starts with 'class ' string representation.
        if (!func || typeof func !== "function") return false;
        const str = func.toString();
        if (str.startsWith("class ")) return true;
        // Function starting with UpperCase is convention, but not guarantee.
        // We will assume that if provided as "ImplementationType" via the direct constructor, it's handled.
        // For this static helper, we might need explicit overloads or just assume usage correctness.
        // For now, let's treat mostly as factory if not explicitly 'class'.
        return str.startsWith("class ");
    }
}
