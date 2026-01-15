import { ServiceCollection } from "../../../src/System/DependencyInjection/ServiceCollection";
import { IServiceProvider, IServiceScope, IServiceScopeFactory } from "../../../src/Domain/Interfaces";

describe("System.DependencyInjection", () => {
    // ... classes ...
    class ServiceA {
        public id = Math.random();
    }
    class ServiceB {
        public id = Math.random();
    }
    class ServiceC {
        public id = Math.random();
    }
    class ServiceWithDep {
        constructor(public dependency: ServiceA) {}
    }

    test("Singleton: Returns same instance", () => {
        const services = new ServiceCollection();
        services.AddSingleton(ServiceA, ServiceA);
        const provider = services.BuildServiceProvider();

        const a1 = provider.GetRequiredService<ServiceA>(ServiceA);
        const a2 = provider.GetRequiredService<ServiceA>(ServiceA);

        expect(a1).toBeInstanceOf(ServiceA);
        expect(a1).toBe(a2);
    });

    test("Transient: Returns different instances", () => {
        const services = new ServiceCollection();
        services.AddTransient(ServiceB, ServiceB);
        const provider = services.BuildServiceProvider();

        const b1 = provider.GetRequiredService<ServiceB>(ServiceB);
        const b2 = provider.GetRequiredService<ServiceB>(ServiceB);

        expect(b1).toBeInstanceOf(ServiceB);
        expect(b1).not.toBe(b2);
    });

    test("Scoped: Different per scope, same within scope", () => {
        const services = new ServiceCollection();
        services.AddScoped(ServiceC, ServiceC);
        const root = services.BuildServiceProvider();
        const rootFactory = root as unknown as IServiceScopeFactory;

        const scope1 = rootFactory.CreateScope();
        const scope2 = rootFactory.CreateScope();

        const c1 = scope1.ServiceProvider.GetRequiredService<ServiceC>(ServiceC);
        const c1_again = scope1.ServiceProvider.GetRequiredService<ServiceC>(ServiceC);
        const c2 = scope2.ServiceProvider.GetRequiredService<ServiceC>(ServiceC);

        expect(c1).toBeInstanceOf(ServiceC);
        expect(c1).toBe(c1_again);
        expect(c1).not.toBe(c2);
    });

    test("Factory Injection: Resolves dependencies", () => {
        const services = new ServiceCollection();
        services.AddSingleton(ServiceA, ServiceA);
        services.AddTransient(ServiceWithDep, (provider: IServiceProvider) => {
            const dep = provider.GetRequiredService<ServiceA>(ServiceA);
            return new ServiceWithDep(dep);
        });

        const provider = services.BuildServiceProvider();
        const svc = provider.GetRequiredService<ServiceWithDep>(ServiceWithDep);

        expect(svc).toBeInstanceOf(ServiceWithDep);
        expect(svc.dependency).toBeInstanceOf(ServiceA);
    });

    test("Instance Registration", () => {
        const services = new ServiceCollection();
        const instance = new ServiceA();
        services.AddSingleton(ServiceA, instance);

        const provider = services.BuildServiceProvider();
        expect(provider.GetService(ServiceA)).toBe(instance);
    });

    test("TryAddSingleton: Prevents duplicates", () => {
        const services = new ServiceCollection();
        services.AddSingleton<string>("key", "val1");
        const added = services.TryAddSingleton<string>("key", "val2" as any); // Cast to any to satisfy signature constraint if needed, checking pure logic

        expect(added).toBe(false);

        const provider = services.BuildServiceProvider();
        expect(provider.GetService("key")).toBe("val1");
    });

    test("GetService returns null if not found", () => {
        const services = new ServiceCollection();
        const provider = services.BuildServiceProvider();
        expect(provider.GetService("Unknown")).toBeNull();
    });

    test("GetRequiredService throws if not found", () => {
        const services = new ServiceCollection();
        const provider = services.BuildServiceProvider();
        expect(() => provider.GetRequiredService("Unknown")).toThrow();
    });

    test("TryAddSingleton: Adds if not exists", () => {
        const services = new ServiceCollection();
        const result = services.TryAddSingleton("newKey", "newValue");
        expect(result).toBe(true);
        const provider = services.BuildServiceProvider();
        expect(provider.GetService("newKey")).toBe("newValue");
    });

    test("Scope Disposal: Clears resources and prevents access", () => {
        const services = new ServiceCollection();
        services.AddScoped(ServiceC, ServiceC);
        const root = services.BuildServiceProvider() as any;
        const scope = root.CreateScope();

        const instance = scope.ServiceProvider.GetRequiredService(ServiceC);
        expect(instance).not.toBeNull();

        scope.Dispose();

        // Ensure calling Dispose again is safe
        scope.Dispose();

        // Assert scope is disposed (via internal provider check or specific error)
        expect(() => scope.ServiceProvider.GetService(ServiceC)).toThrow();
    });

    test("ServiceProvider: Throws if used after dispose", () => {
        const services = new ServiceCollection();
        const provider = services.BuildServiceProvider();
        (provider as any).Dispose();

        expect(() => provider.GetService(ServiceA)).toThrow();
    });

    test("CreateInstance: Throws on invalid descriptor", () => {
        const services = new ServiceCollection();
        const invalidDescriptor = {
            ServiceType: "Invalid",
            Lifetime: 0,
            ImplementationType: undefined,
            ImplementationFactory: undefined,
            ImplementationInstance: undefined,
        };
        // Hack to inject invalid descriptor for testing defensive code
        services.push(invalidDescriptor as any);

        const provider = services.BuildServiceProvider();
        expect(() => provider.GetService("Invalid")).toThrow(/Invalid ServiceDescriptor/);
    });
});
