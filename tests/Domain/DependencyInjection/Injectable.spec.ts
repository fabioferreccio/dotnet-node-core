import "reflect-metadata";
import { Injectable } from "../../../src/Domain/DependencyInjection/Injectable";

describe("Domain.DependencyInjection.Injectable", () => {
    test("Should define 'di:injectable' metadata on the target class", () => {
        // Arrange
        @Injectable()
        class TestService {
            constructor(public readonly name: string) {}
        }

        // Act
        const isInjectable = Reflect.getMetadata("di:injectable", TestService);

        // Assert
        expect(isInjectable).toBe(true);
    });

    test("Should force emission of 'design:paramtypes' (Integration check)", () => {
        // Arrange
        class Dependency {}

        @Injectable()
        class DependentService {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            constructor(private readonly dep: Dependency) {}
        }

        // Act
        const paramTypes = Reflect.getMetadata("design:paramtypes", DependentService);

        // Assert
        expect(paramTypes).toBeDefined();
        expect(paramTypes).toHaveLength(1);
        expect(paramTypes[0]).toBe(Dependency);
    });
});
