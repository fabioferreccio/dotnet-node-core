import {
    RootCommand,
    Command,
    Option,
    Argument,
    Parser,
    HelpBuilder,
    InvocationContext,
    BindingContext,
} from "../../../src/System/CommandLine";
import { AnsiConsole } from "../../../src/System/Console/AnsiConsole";
import { IServiceProvider } from "../../../src/Domain/Interfaces/IServiceProvider";

describe("System.CommandLine Hardened Infrastructure", () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
        AnsiConsole.Configure({ width: 80 });
    });

    afterEach(() => {
        stdoutSpy.mockRestore();
    });

    describe("Symbol & Core Types (Hardened)", () => {
        test("Option should be immutable", () => {
            const opt = Option.From("n", "name");
            expect(Object.isFrozen(opt)).toBe(true);

            const withAlias = opt.AddAlias("-n");
            expect(withAlias).not.toBe(opt);
            expect(withAlias.Aliases.Count).toBe(1);
        });

        test("Argument should handle arity", () => {
            const arg = Argument.From("arg").SetArity(1, 2);
            expect(arg.MinArity.Value).toBe(1);
            expect(arg.MaxArity.Value).toBe(2);
        });

        test("Command should be immutable", () => {
            const cmd = Command.From("test");
            const withOpt = cmd.AddOption(Option.From("opt"));
            expect(withOpt).not.toBe(cmd);
            expect(withOpt.Options.Count).toBe(1);
        });
    });

    describe("Canonical Execution Pipeline", () => {
        test("should follow Parser -> ParseResult -> BindingContext -> InvocationContext", async () => {
            // 1. Setup
            let invoked = false;
            const handler = (ctx: InvocationContext) => {
                invoked = true;
                expect(ctx.BindingContext.GetValueForOption(ctx.Command.Options.ToArray()[0])?.ToString()).toBe(
                    "Fabio",
                );
                expect(ctx.BindingContext.GetValueForArgument(ctx.Command.Arguments.ToArray()[0])?.ToString()).toBe(
                    "data.txt",
                );
            };

            const root = new RootCommand("Test")
                .AddOption(Option.From("--name", "Your name"))
                .AddArgument(Argument.From("input"))
                .SetHandler(handler);

            // 2. Parsing (Structural Matching Only)
            const parser = new Parser(root);
            const parseResult = parser.Parse(["--name", "Fabio", "data.txt"]);
            expect(parseResult.IsSuccessful.Value).toBe(true);

            // 3. Binding (Symbol Resolution & Type Conversion)
            const bindingContext = BindingContext.From(parseResult);
            expect(bindingContext.GetValueForOption(root.Options.ToArray()[0])?.ToString()).toBe("Fabio");

            // 4. Invocation (Execution Barrier)
            const mockServices = {} as IServiceProvider;
            const invocationContext = new InvocationContext(bindingContext, parseResult.Command, mockServices);

            if (parseResult.Command.Handler) {
                await parseResult.Command.Handler(invocationContext);
            }

            expect(invoked).toBe(true);
        });

        test("should resolve subcommands correctly", () => {
            const sub = Command.From("sub");
            const root = new RootCommand().AddCommand(sub);

            const parser = new Parser(root);
            const result = parser.Parse(["sub"]);

            expect(result.Command).toBe(sub);
        });

        test("should handle unknown options as errors", () => {
            const root = new RootCommand();
            const parser = new Parser(root);
            const result = parser.Parse(["--unknown"]);

            expect(result.IsSuccessful.Value).toBe(false);
            expect(result.Errors.Count).toBe(1);
            expect(result.Errors.ToArray()[0].ToString()).toContain("Unknown option");
        });
    });

    describe("HelpBuilder (Deterministic)", () => {
        test("should render deterministic help using rich widgets", () => {
            const root = new RootCommand("Apps description").AddOption(Option.From("--verbose", "Enable logging"));

            const builder = new HelpBuilder(AnsiConsole.Console);
            builder.Write(root);

            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("root"));
            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Apps description"));
            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("--verbose"));
        });

        test("should render subcommands correctly", () => {
            const sub = Command.From("sub", "Sub description");
            const root = new RootCommand("Root").AddCommand(sub);

            const builder = new HelpBuilder(AnsiConsole.Console);
            builder.Write(root);

            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("sub"));
            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Sub description"));
        });

        test("should respect hidden symbols in help rendering", () => {
            const hidden = Option.From("--hidden").SetHidden(true);
            const root = new RootCommand("Root").AddOption(hidden);

            const builder = new HelpBuilder(AnsiConsole.Console);
            builder.Write(root);

            expect(stdoutSpy).not.toHaveBeenCalledWith(expect.stringContaining("--hidden"));
        });
    });

    describe("Edge Cases & Hardened Behavior", () => {
        test("SetHidden should be immutable and work on all symbols", () => {
            const opt = Option.From("o");
            const hiddenOpt = opt.SetHidden(true);
            expect(opt.IsHidden.Value).toBe(false);
            expect(hiddenOpt.IsHidden.Value).toBe(true);

            expect(Argument.From("a").SetHidden(true).IsHidden.Value).toBe(true);
            expect(Command.From("c").SetHidden(true).IsHidden.Value).toBe(true);
        });

        test("Parser should report unexpected arguments", () => {
            const root = new RootCommand().AddArgument(Argument.From("a"));
            const parser = new Parser(root);
            const result = parser.Parse(["val1", "val2"]);
            expect(result.IsSuccessful.Value).toBe(false);
            expect(result.Errors.ToArray().some((e) => e.ToString().includes("Unexpected argument"))).toBe(true);
        });

        test("BindingContext should handle default values", () => {
            const opt = Option.From("--opt", "", "default");
            const root = new RootCommand().AddOption(opt);
            const parser = new Parser(root);
            const result = parser.Parse([]);
            const binding = BindingContext.From(result);

            expect(binding.GetValueForOption(opt)).toBe("default");
        });
    });
});
