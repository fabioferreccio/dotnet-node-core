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
// Strict factory for Self-Binding (0 args)
export type SelfBindingFactory<T = unknown> = () => T;

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

    // 1. Self-Binding: Singleton(MyClass)
    public static Singleton<T>(serviceType: Constructor<T>): ServiceDescriptor;
    // 2. Self-Binding + Factory: Singleton(MyClass, () => new MyClass())
    public static Singleton<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): ServiceDescriptor;
    // 3. Token-Based registrations (Legacy/Standard)
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): ServiceDescriptor;
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    public static Singleton<T>(serviceType: ServiceIdentifier<T>, instance: T): ServiceDescriptor;

    // Implementation
    public static Singleton(serviceType: ServiceIdentifier, arg2?: unknown): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, ServiceLifetime.Singleton, arg2);
    }

    // Scoped
    public static Scoped<T>(serviceType: Constructor<T>): ServiceDescriptor;
    public static Scoped<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): ServiceDescriptor;
    public static Scoped<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): ServiceDescriptor;
    public static Scoped<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;
    // Note: Scoped instance registration is usually invalid in DI concepts (always singleton effectively), but if legacy supported it, we keep signature.
    // Usually Scoped(Instance) is nonsensical. But we follow pattern.

    public static Scoped(serviceType: ServiceIdentifier, arg2?: unknown): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, ServiceLifetime.Scoped, arg2);
    }

    // Transient
    public static Transient<T>(serviceType: Constructor<T>): ServiceDescriptor;
    public static Transient<T>(serviceType: Constructor<T>, factory: SelfBindingFactory<T>): ServiceDescriptor;
    public static Transient<T>(serviceType: ServiceIdentifier<T>, implementation: Constructor<T>): ServiceDescriptor;
    public static Transient<T>(serviceType: ServiceIdentifier<T>, factory: ImplementationFactory<T>): ServiceDescriptor;

    public static Transient(serviceType: ServiceIdentifier, arg2?: unknown): ServiceDescriptor {
        return ServiceDescriptor.Describe(serviceType, ServiceLifetime.Transient, arg2);
    }

    public static Describe(
        serviceType: ServiceIdentifier,
        lifetime: ServiceLifetime,
        arg2?: unknown,
    ): ServiceDescriptor {
        // Validation Checks
        const isServiceCtor = ServiceDescriptor.IsConstructor(serviceType);

        // Case 1: Single Argument (Self-Binding)
        if (arg2 === undefined) {
            if (!isServiceCtor) {
                throw new Error(
                    "Invalid Registration: Single-argument registration must be a Class Constructor (Self-Binding).",
                );
            }
            // Self-Binding: ServiceType IS ImplementationType
            return new ServiceDescriptor(
                serviceType,
                lifetime,
                serviceType as Constructor<unknown>,
                undefined,
                undefined,
            );
        }

        // Case 2: Two Arguments
        // Context: Self-Binding (ServiceType is Constructor) vs Token Binding

        const isArg2Factory = typeof arg2 === "function" && !ServiceDescriptor.IsConstructor(arg2);
        const isArg2Ctor = ServiceDescriptor.IsConstructor(arg2);

        if (isServiceCtor) {
            // STRICT SELF-BINDING RULES

            // Check for explicit "Redundant" Self-Binding: AddSingleton(A, A)
            if (arg2 === serviceType) {
                throw new Error(
                    "Invalid Registration: Redundant self-binding. Use single-argument 'AddSingleton(MyClass)' instead.",
                );
            }

            // Check for Prohibited: AddSingleton(Class, Instance)
            // If arg2 is NOT a function (Factory or Ctor), it's an Instance.
            if (typeof arg2 !== "function") {
                throw new Error(
                    "Invalid Registration: Self-binding using an instance is PROHIBITED. Use a Factory or Token-based registration.",
                );
            }

            // If arg2 is another Constructor? (Mapping A -> B)
            // Rules say: "Any other combination MUST throw".
            // "Two arguments: First arg MUST be Service Type... Second arg MUST be zero-argument factory... Any other combination MUST throw."
            // This strictly prohibits A -> B mapping if A is a concrete class?
            // "Self-binding with implementation type is NOT supported" (interpreted as A->A).
            // But what about A->B?
            // If I ban A->B, I limit the DI significantly (cannot swap implementation of concrete class).
            // BUT, strict instructions: "Any other combination MUST throw".
            // I will enforce the strict factory rule if ServiceType is Constructor.

            if (isArg2Ctor) {
                // Prohibit A -> B where A is Constructor.
                // Wait, this might break "Abstract Class -> Concrete Class" if Abstract Class is detected as Constructor.
                // Abstract classes usually detected as Constructors (functions with prototype).
                // If I ban this, I ban "Base -> Derived".
                // BUT rules said: "Token-based registrations ... must not be broken".
                // Use of Base Class is a "Token" conceptually.
                // How to distinguish "Concrete Class intended as Self" vs "Base Class intended as Token"?
                // I cannot reliably.
                // However, the prompt emphasizes "Self-Binding" overloads.
                // If I allow A->B, I satisfy "Token -> Impl".
                // Let's assume A->B is VALID Token Binding.
                // The PROHIBITION is strictly on "Self-Binding variants that are loose".
                // So: A->A is bad. A->Instance is bad.
                // A->B (Ctor matches Ctor) should be OK?
                // But check "Factory rules": "Second argument MUST be a zero-argument factory function".
                // If I enforce this for ALL Constructor service types, I ban A->B.
                // COMPROMISE:
                // The constraints are specifically for "Self-Binding".
                // I will Valid check:
                // If Arg2 is Factory: Check 0-args.
                // If Arg2 is NOT Factory:
                //    If Arg2 is Ctor AND Arg2 !== ServiceType: Allow (Token Mapping).
                //    Else: Reject.
            }

            if (isArg2Factory) {
                // Enforce 0-arguments for Factory in Self-Binding
                const fn = arg2 as Function;
                if (fn.length !== 0) {
                    throw new Error(
                        "Invalid Registration: Factory function for Self-Binding must not accept arguments (Strict 0-args).",
                    );
                }
            }
        }

        // Implementation Resolution
        let implementationType: Constructor<unknown> | undefined;
        let implementationInstance: unknown | undefined;
        let implementationFactory: ImplementationFactory | undefined;

        if (isArg2Factory) {
            implementationFactory = arg2 as ImplementationFactory;
        } else if (isArg2Ctor) {
            implementationType = arg2 as Constructor<unknown>;
        } else {
            implementationInstance = arg2;
        }

        // Final Ambiguity Check failure (e.g. A->Instance)
        if (isServiceCtor && !isArg2Factory && !implementationType) {
            // This path covers (Class, Instance).
            throw new Error(
                "Invalid Registration: Self-binding using an instance is PROHIBITED. Use a Factory or Token-based registration.",
            );
        }

        return new ServiceDescriptor(
            serviceType,
            lifetime,
            implementationType,
            implementationInstance,
            implementationFactory,
        );
    }

    private static IsConstructor(func: unknown): boolean {
        if (!func || typeof func !== "function") return false;

        // 1. Native Class Check
        const str = func.toString();
        if (str.startsWith("class ")) return true;

        // 2. Transpiled Class / Function Constructor Check
        // Arrow functions do not have a prototype.
        if (func.prototype) return true;

        return false;
    }
}
