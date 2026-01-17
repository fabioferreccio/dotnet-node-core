import { CancellationToken } from "../../../src/System/Threading/CancellationToken";

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
        const token = new CancellationToken(true);
        expect(token.IsCancellationRequested).toBe(true);
        expect(() => token.ThrowIfCancellationRequested()).toThrow("OperationCancelledException");
    });
});
