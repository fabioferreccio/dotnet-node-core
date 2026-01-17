import { ServiceCollection } from "../../../src/System/DependencyInjection/ServiceCollection";

describe("System.DependencyInjection.ServiceCollection", () => {
    class MyService {
        public id = Math.random();
    }

    test("AddSingleton works with Self-Binding (1 arg)", () => {
        const services = new ServiceCollection();
        // Updated: Use 1-arg overload
        services.AddSingleton(MyService);

        expect(services.length).toBe(1);
        expect(services[0].ServiceType).toBe(MyService);
        expect(services[0].ImplementationType).toBe(MyService); // Self-binding
    });

    test("TryAddSingleton avoids duplicates", () => {
        const services = new ServiceCollection();
        services.AddSingleton(MyService);
        const result = services.TryAddSingleton(MyService);
        expect(result.Value).toBe(false);
        expect(services.length).toBe(1);
    });

    test("Is Iterable", () => {
        const services = new ServiceCollection();
        services.AddSingleton(MyService);

        let count = 0;
        for (const _d of services) {
            count++;
        }
        expect(count).toBe(1);
    });

    test("TryAddSingleton returns result with Token", () => {
        interface IMyTestService {
            doSomething(): void;
        }

        class MyTestService implements IMyTestService {
            doSomething(): void {
                console.log("Done");
            }
        }

        const services = new ServiceCollection();
        // Token -> Implementation (2 args) - Unchanged Valid
        services.AddSingleton("IMyTestService", MyTestService);

        const provider = services.BuildServiceProvider();
        const service = provider.GetService("IMyTestService");
        // Note: IMyTestService is a ServiceToken object, not Constructor.
        // GetService checks strict equality on token.
        // Wait, provider.GetService might expect Constructor? No, ServiceIdentifier.
        // Checks 'toBeInstanceOf' won't work on Interface (it's unknown at runtime).
        // But the returned object is instance of MyTestService.
        expect(service instanceof MyTestService).toBe(true);
    });

    // ==========================================
    // NEW STRICT SELF-BINDING TESTS
    // ==========================================

    test("Self-Binding Singleton resolves to correct instance", () => {
        const services = new ServiceCollection();
        services.AddSingleton(MyService);
        const provider = services.BuildServiceProvider();

        const s1 = provider.GetService(MyService);
        const s2 = provider.GetService(MyService);

        expect(s1).toBeInstanceOf(MyService);
        expect(s1).toBe(s2); // Singleton
    });

    test("Self-Binding + Factory works (2 args)", () => {
        class ConfigService {
            constructor(public val: number) {}
        }

        const services = new ServiceCollection();
        // Factory must be 0-args
        services.AddSingleton(ConfigService, () => new ConfigService(42));

        const provider = services.BuildServiceProvider();
        const svc = provider.GetService(ConfigService);

        expect(svc).toBeInstanceOf(ConfigService);
        expect(svc!.val).toBe(42);
    });

    // ==========================================
    // NEGATIVE TESTS (Strict Prohibitions)
    // ==========================================

    test("Throws on Redundant Self-Binding (Class, Class)", () => {
        const services = new ServiceCollection();
        expect(() => {
            services.AddSingleton(MyService, MyService);
        }).toThrow(/Redundant self-binding/);
    });

    test("Throws on Self-Binding with Instance (Class, Instance)", () => {
        const services = new ServiceCollection();
        expect(() => {
            services.AddSingleton(MyService, new MyService());
        }).toThrow(/Self-binding using an instance is PROHIBITED/);
    });

    test("Throws on Self-Binding with Invalid Factory (Strict 0-args)", () => {
        const services = new ServiceCollection();
        expect(() => {
            services.AddSingleton(MyService, (p: any) => new MyService());
        }).toThrow(/Factory function for Self-Binding must not accept arguments/);
    });

    test("Throws on Single Argument if not Constructor (Token)", () => {
        const token = "TEST";
        const services = new ServiceCollection();
        expect(() => {
            // @ts-expect-error Testing invalid runtime call
            services.AddSingleton(token);
        }).toThrow(/Single-argument registration must be a Class Constructor/);
    });
});
