import { EndOfStreamException } from "../../../src/System/IO/EndOfStreamException";

describe("IO Exceptions", () => {
    test("EndOfStreamException instantiates", () => {
        const ex = new EndOfStreamException();
        expect(ex.message).toBe("Unable to read beyond the end of the stream.");

        const ex2 = new EndOfStreamException("Custom message");
        expect(ex2.message).toBe("Custom message");
    });
});
