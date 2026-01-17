// Polyfill for Symbol.dispose
if (!(Symbol as unknown as { dispose: symbol }).dispose) {
    (Symbol as unknown as { dispose: symbol }).dispose = Symbol("Symbol.dispose");
}
if (!(Symbol as unknown as { asyncDispose: symbol }).asyncDispose) {
    (Symbol as unknown as { asyncDispose: symbol }).asyncDispose = Symbol("Symbol.asyncDispose");
}

import { ServiceCollection } from "../../../src/System/DependencyInjection/ServiceCollection";
import { IServiceProvider, IServiceScopeFactory, IDisposable, IAsyncDisposable } from "../../../src/Domain/Interfaces";

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

    class DisposableService {
        public isDisposed = false;
        public Dispose(): void {
            this.isDisposed = true;
        }
        public [Symbol.dispose](): void {
            this.Dispose();
        }
    }

    test("Singleton: Returns same instance", () => {
        const services = new ServiceCollection();
        services.AddSingleton(ServiceA);
        const provider = services.BuildServiceProvider();

        const a1 = provider.GetRequiredService<ServiceA>(ServiceA);
        const a2 = provider.GetRequiredService<ServiceA>(ServiceA);

        expect(a1).toBeInstanceOf(ServiceA);
        expect(a1).toBe(a2);
    });

    test("Transient: Returns different instances", () => {
        const services = new ServiceCollection();
        services.AddTransient(ServiceB);
        const provider = services.BuildServiceProvider();

        const b1 = provider.GetRequiredService<ServiceB>(ServiceB);
        const b2 = provider.GetRequiredService<ServiceB>(ServiceB);

        expect(b1).toBeInstanceOf(ServiceB);
        expect(b1).not.toBe(b2);
    });

    test("Scoped: Different per scope, same within scope", () => {
        const services = new ServiceCollection();
        services.AddScoped(ServiceC);
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
        services.AddSingleton(ServiceA);
        // Use string token to allow Factory with Provider (Self-Binding strict rule bans factory args)
        services.AddTransient("IServiceWithDep", (provider: IServiceProvider) => {
            const dep = provider.GetRequiredService<ServiceA>(ServiceA);
            return new ServiceWithDep(dep);
        });

        const provider = services.BuildServiceProvider();
        const svc = provider.GetRequiredService<ServiceWithDep>("IServiceWithDep");

        expect(svc).toBeInstanceOf(ServiceWithDep);
        expect(svc.dependency).toBeInstanceOf(ServiceA);
    });

    test("Instance Registration", () => {
        const services = new ServiceCollection();
        const instance = new ServiceA();
        services.AddSingleton(ServiceA, () => instance);

        const provider = services.BuildServiceProvider();
        expect(provider.GetService(ServiceA)).toBe(instance);
    });

    test("TryAddSingleton: Prevents duplicates", () => {
        const services = new ServiceCollection();
        services.AddSingleton<string>("key", "val1");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const added = services.TryAddSingleton<string>("key", "val2" as any); // Cast to any to satisfy signature constraint if needed, checking pure logic

        expect(added.Value).toBe(false);

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
        expect(result.Value).toBe(true);
        const provider = services.BuildServiceProvider();
        expect(provider.GetService("newKey")).toBe("newValue");
    });

    test("Scope Disposal: Clears resources and prevents access", () => {
        const services = new ServiceCollection();
        services.AddScoped(ServiceC);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        (provider as unknown as IDisposable).Dispose();

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
        // Use public Add and cast to bypass type check for test
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        services.Add(invalidDescriptor as unknown as ServiceDescriptor);

        const provider = services.BuildServiceProvider();
        expect(() => provider.GetService("Invalid")).toThrow(/Invalid ServiceDescriptor/);
    });

    test("Scoped Service implementing IDisposable is disposed when scope is disposed", () => {
        const services = new ServiceCollection();
        services.AddScoped(DisposableService);
        const root = services.BuildServiceProvider();
        const factory = root as unknown as IServiceScopeFactory;

        let svc: DisposableService;
        {
            const scope = factory.CreateScope();
            svc = scope.ServiceProvider.GetRequiredService(DisposableService);
            expect(svc.isDisposed).toBe(false);
            scope.Dispose();
        }
        expect(svc!.isDisposed).toBe(true);
    });

    test("Singleton Service implementing IDisposable is disposed when provider is disposed", () => {
        const services = new ServiceCollection();
        services.AddSingleton(DisposableService);
        const provider = services.BuildServiceProvider();

        const svc = provider.GetRequiredService(DisposableService);
        expect(svc.isDisposed).toBe(false);

        // Dispose provider
        (provider as unknown as IDisposable).Dispose();

        expect(svc.isDisposed).toBe(true);
    });

    test("ServiceProvider can be used with 'using'", () => {
        const services = new ServiceCollection();
        services.AddSingleton(DisposableService);

        let svcRef: DisposableService;
        {
            using provider = services.BuildServiceProvider() as unknown as IDisposable;
            svcRef = (provider as unknown as IServiceProvider).GetRequiredService(DisposableService);
            expect(svcRef.isDisposed).toBe(false);
        }
        // Provider was disposed, so Singletons should be disposed
        expect(svcRef!.isDisposed).toBe(true);
    });
    test("Multiple Scoped Services are disposed when scope is disposed", () => {
        const services = new ServiceCollection();
        services.AddScoped(DisposableService);
        services.AddScoped(DisposableService); // Added twice? No, same type.
        // Need distinct types or Transient to simulate multiple instances if Scoped?
        // Logic: Get service twice -> same instance (Scoped).
        // To test multiple *different* services, register another class.
        class DisposableService2 {
            public isDisposed = false;
            public Dispose() {
                this.isDisposed = true;
            }
            public [Symbol.dispose]() {
                this.Dispose();
            }
        }
        services.AddScoped(DisposableService2);

        const root = services.BuildServiceProvider() as unknown as IServiceScopeFactory;

        let d1: DisposableService;
        let d2: DisposableService2;

        {
            using scope = root.CreateScope() as unknown as IDisposable;
            d1 = (scope as unknown as { ServiceProvider: IServiceProvider }).ServiceProvider.GetRequiredService(
                DisposableService,
            );
            d2 = (scope as unknown as { ServiceProvider: IServiceProvider }).ServiceProvider.GetRequiredService(
                DisposableService2,
            );

            // Spy on Dispose
            jest.spyOn(d1, "Dispose");
            jest.spyOn(d2, "Dispose");
        } // Scope disposed here

        expect(d1!.isDisposed).toBe(true);
        expect(d2!.isDisposed).toBe(true);
        expect(d1!.Dispose).toHaveBeenCalled();
        expect(d1!.Dispose).toHaveBeenCalled();
        expect(d2!.Dispose).toHaveBeenCalled();
    });

    test("ServiceScope.DisposeAsync calls Dispose and disposes services", async () => {
        const services = new ServiceCollection();
        services.AddScoped(DisposableService);
        const root = services.BuildServiceProvider() as unknown as IServiceScopeFactory;

        let svc: DisposableService;
        {
            await using scope = root.CreateScope() as unknown as IAsyncDisposable;
            svc = (scope as unknown as { ServiceProvider: IServiceProvider }).ServiceProvider.GetRequiredService(
                DisposableService,
            );
        }
        expect(svc!.isDisposed).toBe(true);
    });

    test("ServiceProvider.DisposeAsync calls Dispose and disposes singletons", async () => {
        const services = new ServiceCollection();
        services.AddSingleton(DisposableService);
        const provider = services.BuildServiceProvider();

        const svc = provider.GetRequiredService(DisposableService);
        await (provider as unknown as IAsyncDisposable).DisposeAsync();

        expect(svc.isDisposed).toBe(true);
    });
});
