import { NotSupportedException } from "../../src/System/NotSupportedException";

describe("System.NotSupportedException", () => {
    test("Constructor: with message", () => {
        const ex = new NotSupportedException("Operation not supported");
        expect(ex.Message).toBe("Operation not supported");
    });

    test("Constructor: default message", () => {
        const ex = new NotSupportedException();
        expect(ex.Message).toBe("Specified method is not supported.");
    });

    test("Identity and Type Check", () => {
        const ex = new NotSupportedException();
        expect(ex).toBeInstanceOf(Error);
        expect(ex).toBeInstanceOf(NotSupportedException);
    });
});
