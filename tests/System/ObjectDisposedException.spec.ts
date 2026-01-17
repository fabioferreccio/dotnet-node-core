import { ObjectDisposedException } from "../../src/System/ObjectDisposedException";

describe("System.ObjectDisposedException", () => {
    test("Constructor: Object Name and Message", () => {
        const ex = new ObjectDisposedException("MyObject", "Specific error");
        expect(ex.ObjectName).toBe("MyObject");
        expect(ex.Message).toBe("Specific error");
    });

    test("Constructor: Only Object Name", () => {
        const ex = new ObjectDisposedException("MyObject");
        expect(ex.ObjectName).toBe("MyObject");
        expect(ex.Message).toBe("Cannot access a disposed object.");
    });

    test("Properties: Getters", () => {
        const ex = new ObjectDisposedException("Obj");
        expect(ex.ObjectName).toBe("Obj");
    });
});
