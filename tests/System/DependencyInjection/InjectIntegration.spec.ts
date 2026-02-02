import "reflect-metadata";
import { ServiceCollection } from "../../../src/System/DependencyInjection/ServiceCollection";
import { Injectable } from "../../../src/Domain/DependencyInjection/Injectable";
import { Inject } from "../../../src/Domain/DependencyInjection/Inject";

describe("System.DependencyInjection.Inject (Integration)", () => {
    // Shared types for tests
    abstract class IRepo {
        abstract getData(): string;
    }

    class MockRepo extends IRepo {
        getData() {
            return "data";
        }
    }

    @Injectable()
    class ServiceWithInject {
        constructor(@Inject("IRepo") public readonly repo: IRepo) {}
    }

    interface IErased {
        doSomething(): void;
    }

    class DepImplem implements IErased {
        doSomething(): void {}
    }

    @Injectable()
    class ServiceWithErasure {
        constructor(public readonly dep: IErased) {}
    }

    test("Should resolve dependency using @Inject token when interface type is erased to Object", () => {
        // Arrange
        const services = new ServiceCollection();
        services.AddSingleton("IRepo", MockRepo);
        services.AddTransient(ServiceWithInject);

        const provider = services.BuildServiceProvider();

        // Act
        const service = provider.GetRequiredService(ServiceWithInject);

        // Assert
        expect(service.repo).toBeInstanceOf(MockRepo);
        expect(service.repo.getData()).toBe("data");
    });

    test("Should warn in console when resolving 'Object' without @Inject", () => {
        // Arrange
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

        const services = new ServiceCollection();
        // Since IErased is erased to Object, we must register it as Object to allow resolution
        // (even though we expect a warning)
        services.AddSingleton(Object, DepImplem);
        services.AddTransient(ServiceWithErasure);

        const provider = services.BuildServiceProvider();

        // Act
        provider.GetRequiredService(ServiceWithErasure);

        // Assert
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("resolved as 'Object'"));

        warnSpy.mockRestore();
    });
});
