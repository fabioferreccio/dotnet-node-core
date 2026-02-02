import { Console } from "../../src/System/Console";
import { CsString } from "../../src/System/Types/CsString";

describe("System.Console", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    test("WriteLine(CsString) - Should call toString() on object", () => {
        const str = CsString.From("Hello");
        Console.WriteLine(str);
        expect(stdoutSpy).toHaveBeenCalledWith("Hello");
    });

    test("WriteLine(string) - Should handle primitive string", () => {
        Console.WriteLine("Primitive");
        expect(stdoutSpy).toHaveBeenCalledWith("Primitive");
    });

    test("WriteLine(null) - Should print empty string", () => {
        // Based on current implementation implementation: console.log(value ? ... : "")
        Console.WriteLine(null);
        expect(stdoutSpy).toHaveBeenCalledWith("");

        Console.WriteLine(undefined);
        expect(stdoutSpy).toHaveBeenCalledWith("");
    });
});
