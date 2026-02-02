import "reflect-metadata";
import { Inject, INJECT_METADATA_KEY } from "../../../src/Domain/DependencyInjection/Inject";
import { Injectable } from "../../../src/Domain/DependencyInjection/Injectable";

describe("Domain.DependencyInjection.Inject", () => {
    test("Should define 'di:inject' metadata on the target class constructor", () => {
        // Arrange
        const TOKEN = "MY_TOKEN";

        @Injectable()
        class TestService {
            constructor(@Inject(TOKEN) public readonly dep: unknown) {}
        }

        // Act
        const metadata = Reflect.getOwnMetadata(INJECT_METADATA_KEY, TestService);

        // Assert
        expect(metadata).toBeDefined();
        expect(metadata[0]).toBe(TOKEN);
    });

    test("Should handle multiple @Inject decorators", () => {
        // Arrange
        const TOKEN1 = "TOKEN1";
        const TOKEN2 = "TOKEN2";

        @Injectable()
        class TestService {
            constructor(
                @Inject(TOKEN1) public readonly dep1: unknown,
                @Inject(TOKEN2) public readonly dep2: unknown,
            ) {}
        }

        // Act
        const metadata = Reflect.getOwnMetadata(INJECT_METADATA_KEY, TestService);

        // Assert
        expect(metadata).toBeDefined();
        expect(metadata[0]).toBe(TOKEN1);
        expect(metadata[1]).toBe(TOKEN2);
    });
});
