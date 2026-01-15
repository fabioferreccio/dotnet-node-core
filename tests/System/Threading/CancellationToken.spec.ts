import { CancellationToken } from "../../../src/System/Threading/CancellationToken";
import { Exception } from "../../../src/Domain/SeedWork/Exception";

describe("CancellationToken", () => {
    test("None returns a non-cancelled token", () => {
        const token = CancellationToken.None;
        expect(token).toBeDefined();
        expect(token.IsCancellationRequested).toBe(false);
    });

    test("ThrowIfCancellationRequested does nothing if not cancelled", () => {
        const token = CancellationToken.None;
        expect(() => token.ThrowIfCancellationRequested()).not.toThrow();
    });

    test("Pre-cancelled token throws", () => {
        // Assuming we can create one via constructor or source (not asking for source yet but constructor is public?)
        // Inspecting CancellationToken.ts: constructor(checkForCancellation: boolean = false)
        const token = new CancellationToken(true);
        expect(token.IsCancellationRequested).toBe(true);
        expect(() => token.ThrowIfCancellationRequested()).toThrow("OperationCancelledException");
    });

    test("Mocked None token throws if forced", () => {
        const token = CancellationToken.None;
        // Force IsCancellationRequested to be true via Spy
        jest.spyOn(token, "IsCancellationRequested", "get").mockReturnValue(true);

        expect(token.IsCancellationRequested).toBe(true);
        // This ensures the ThrowIfCancellationRequested logic (which checks the property) is executed
        expect(() => token.ThrowIfCancellationRequested()).toThrow("OperationCancelledException");
    });
});
