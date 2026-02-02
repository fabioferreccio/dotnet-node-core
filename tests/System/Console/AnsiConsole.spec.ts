import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { Rule } from "../../../src/System/Console/Rule";
import { Panel } from "../../../src/System/Console/Panel";
import { CsString } from "../../../src/System/Types/CsString";

describe("System.Console.AnsiConsole", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 80 }); // Deterministic width
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    test("Markup should correctly apply ANSI colors", () => {
        AnsiConsole.Markup("[red]Hello[/]");
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\u001b[31mHello\u001b[0m"));
    });

    test("Markup should handle nested colors", () => {
        AnsiConsole.Markup("[red]Red[blue]Blue[/]Red[/]");
        const output = stdoutSpy.mock.calls[0][0];
        expect(output).toContain("\u001b[31mRed");
        expect(output).toContain("\u001b[34mBlue");
        expect(output).toContain("\u001b[31mRed");
    });

    test("Markup should handle unknown tags as default color", () => {
        AnsiConsole.Markup("[unknown]Text[/]");
        expect(stdoutSpy).toHaveBeenCalledWith("Text\u001b[0m");
    });

    test("AnsiConsole.Write should handle CsString", () => {
        AnsiConsole.Write(CsString.From("Direct"));
        expect(stdoutSpy).toHaveBeenCalledWith("Direct");
    });

    test("AnsiConsole.Width should return configured width", () => {
        AnsiConsole.Configure({ width: 120 });
        expect(AnsiConsole.Console.Width).toBe(120);
    });

    test("Rule should render horizontal line with deterministic width", () => {
        AnsiConsole.Configure({ width: 80 });
        const rule = new Rule();
        rule.Render(AnsiConsole.Console);
        expect(stdoutSpy).toHaveBeenCalledWith("─".repeat(80));
    });

    test("Rule with title and style should render combined markup", () => {
        const rule = new Rule("Title", "red");
        rule.Render(AnsiConsole.Console);
        // Expecting red ANSI code followed by the rule content
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\u001b[31m"));
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Title"));
    });

    test("Panel should render bordered box", () => {
        const panel = new Panel("Content", "Title");
        panel.Render(AnsiConsole.Console);
        const top = "┌─ Title " + "─".repeat(70) + "┐";
        expect(stdoutSpy).toHaveBeenCalledWith(top);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("│Content"));
        expect(stdoutSpy).toHaveBeenCalledWith("└" + "─".repeat(78) + "┘");
    });

    test("Panel with style should apply markup", () => {
        const panel = new Panel("Content", "", "blue");
        panel.Render(AnsiConsole.Console);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\u001b[34m┌"));
    });

    test("Panel with style should apply markup", () => {
        const panel = new Panel("Content", "", "blue");
        panel.Render(AnsiConsole.Console);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\u001b[34m┌"));
    });
});

import { AnsiEncoder } from "../../../src/System/Console/Internal/AnsiEncoder";
import { Color } from "../../../src/System/Console/Color";

describe("System.Console.Internal.AnsiEncoder", () => {
    test("GetForegroundColor should handle 8-bit colors", () => {
        const color = Color.FromNumber(100);
        expect(AnsiEncoder.GetForegroundColor(color)).toBe("\u001b[38;5;100m");
    });

    test("GetBackgroundColor should handle 4-bit and 8-bit colors", () => {
        expect(AnsiEncoder.GetBackgroundColor(Color.Default)).toBe("");
        expect(AnsiEncoder.GetBackgroundColor(Color.Red)).toBe("\u001b[41m");
        const color = Color.FromNumber(200);
        expect(AnsiEncoder.GetBackgroundColor(color)).toBe("\u001b[48;5;200m");
    });

    test("GetStyle should handle all supported styles", () => {
        expect(AnsiEncoder.GetStyle("bold")).toBe("\u001b[1m");
        expect(AnsiEncoder.GetStyle("dim")).toBe("\u001b[2m");
        expect(AnsiEncoder.GetStyle("italic")).toBe("\u001b[3m");
        expect(AnsiEncoder.GetStyle("underline")).toBe("\u001b[4m");
        expect(AnsiEncoder.GetStyle("invert")).toBe("\u001b[7m");
        expect(AnsiEncoder.GetStyle("unknown")).toBe("");
    });
});

describe("System.Console.Color", () => {
    test("Equals should handle null and non-color objects", () => {
        const color = Color.Red;
        expect(color.Equals(null as any)).toBe(false);
        expect(color.Equals(undefined as any)).toBe(false);
    });

    test("Number property should return value", () => {
        expect(Color.Red.Number.Value).toBe(1);
    });

    test("ToString should return name", () => {
        expect(Color.Red.ToString()).toBe("Red");
        expect(Color.FromNumber(123).ToString()).toBe("Color_123");
    });
});

describe("System.Console.Internal.MarkupParser", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    test("Parse should resolve all standard colors", () => {
        const colors = ["green", "blue", "yellow", "magenta", "cyan", "white", "black"];
        colors.forEach((c) => {
            AnsiConsole.Markup(`[${c}]Test[/]`);
            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`\\u001b\\[\\d+mTest`)));
        });
    });
});

describe("System.Console.AnsiConsole Singleton", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 80 });
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    test("Console getter should initialize instance if null", () => {
        // We can't easily reset the private static _current, but we can verify it returns an instance
        const instance = AnsiConsole.Console;
        expect(instance).toBeDefined();
    });

    test("Static Markup method should delegate", () => {
        AnsiConsole.Markup("[red]Static[/]");
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\u001b[31mStatic"));
    });
});
