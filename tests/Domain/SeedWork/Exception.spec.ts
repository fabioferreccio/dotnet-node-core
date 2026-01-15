import { Exception } from "../../../src/Domain/SeedWork/Exception";

describe("Exception (Domain/SeedWork)", () => {
    test("toString returns correct format", () => {
        const ex = new Exception("Test Message");
        expect(ex.toString()).toBe("[Exception] Test Message");
    });

    test("InnerException is set correctly", () => {
        const inner = new Error("Inner");
        const ex = new Exception("Outer", inner);
        expect(ex.InnerException).toBe(inner);
        expect(ex.cause).toBe(inner);
    });

    test("Message getter works", () => {
        const ex = new Exception("Msg");
        expect(ex.Message).toBe("Msg");
    });
});
