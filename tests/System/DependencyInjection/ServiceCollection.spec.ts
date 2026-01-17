import { ServiceCollection } from "../../../src/System/DependencyInjection/ServiceCollection";
import { ServiceDescriptor } from "../../../src/Domain/DependencyInjection/ServiceDescriptor";

describe("System.DependencyInjection.ServiceCollection", () => {
    class MyService {}

    test("AddSingleton works", () => {
        const services = new ServiceCollection();
        services.AddSingleton(MyService, MyService);
        // It's an array
        expect(services.length).toBe(1);
        expect(services[0].ServiceType).toBe(MyService);
    });

    // Contains, Remove, Clear are NOT part of ServiceCollection class definition in this codebase.
    // It extends Array<ServiceDescriptor>.
    // To check existence, we check array contents.
    
    test("TryAddSingleton avoids duplicates", () => {
        const services = new ServiceCollection();
        services.AddSingleton(MyService, MyService);
        const result = services.TryAddSingleton(MyService, MyService);
        expect(result.Value).toBe(false);
        expect(services.length).toBe(1);
    });

    test("Is Iterable", () => {
        const services = new ServiceCollection();
        services.AddSingleton(MyService, MyService);
        
        let count = 0;
        for (const _d of services) {
            count++;
        }
        expect(count).toBe(1);
    });
});
