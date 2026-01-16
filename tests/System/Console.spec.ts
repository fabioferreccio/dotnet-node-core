import { Console } from "../../src/System/Console";
import { CsString } from "../../src/System/Types/CsString";

describe("System.Console", () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    test("WriteLine(CsString) - Should call toString() on object", () => {
        const str = CsString.From("Hello");
        Console.WriteLine(str);
        expect(logSpy).toHaveBeenCalledWith("Hello");
    });

    test("WriteLine(string) - Should handle primitive string", () => {
        Console.WriteLine("Primitive");
        expect(logSpy).toHaveBeenCalledWith("Primitive");
    });

    test("WriteLine(null) - Should print empty string", () => {
        // Based on current implementation implementation: console.log(value ? ... : "")
        Console.WriteLine(null);
        expect(logSpy).toHaveBeenCalledWith("");

        Console.WriteLine(undefined);
        expect(logSpy).toHaveBeenCalledWith("");
    });
});
