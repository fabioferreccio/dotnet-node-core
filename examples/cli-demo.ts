import { System } from "../src/System";

const { CommandLine, AnsiConsole } = System;

async function main() {
    AnsiConsole.Configure({ width: 80 });

    // 1. Definition
    const rootCommand = new CommandLine.RootCommand("Framework Demo CLI")
        .AddOption(CommandLine.Option.From<boolean>("--verbose", "Enable verbose logging", false))
        .AddOption(CommandLine.Option.From<number>("--count", "Number of iterations", 1))
        .AddArgument(CommandLine.Argument.From<string>("name", "The name to greet"))
        .SetHandler(async (context) => {
            const isVerbose = context.BindingContext.GetValueForOption<boolean>(context.Command.Options.ToArray()[0]);
            const count = context.BindingContext.GetValueForOption<System.Int32>(context.Command.Options.ToArray()[1]);
            const name = context.BindingContext.GetValueForArgument<System.String>(context.Command.Arguments.ToArray()[0]);

            AnsiConsole.MarkupLine(`[green]Hello, ${name}![/]`);
            AnsiConsole.MarkupLine(`[yellow]Iterations:[/] ${count?.Value}`);
            
            if (isVerbose) {
                AnsiConsole.WriteLine("Verbose mode is ON. Printing internal metrics...");
            }
        });

    // 2. Mock Arguments
    const argv = ["--verbose", "--count", "5", "Antigravity"];

    AnsiConsole.MarkupLine("[blue]Executing Pipeline...[/]");

    // 3. Canononical Pipeline
    try {
        // Step A: Parsing (Structural)
        const parser = new CommandLine.Parser(rootCommand);
        const parseResult = parser.Parse(argv);

        if (!parseResult.IsSuccessful.Value) {
            AnsiConsole.MarkupLine("[red]Errors encountered during parsing:[/]");
            for (const error of parseResult.Errors.ToArray()) {
                AnsiConsole.WriteLine(`- ${error.ToString()}`);
            }
            return;
        }

        // Step B: Binding (Typed Resolution)
        const bindingContext = CommandLine.BindingContext.From(parseResult);

        // Step C: Execution (Boundary)
        const mockServices = {} as any; 
        const invocationContext = new CommandLine.InvocationContext(bindingContext, parseResult.Command, mockServices);

        // Step D: Invoke Handler
        if (parseResult.Command.Handler) {
            await parseResult.Command.Handler(invocationContext);
        }

        AnsiConsole.MarkupLine("[green]Execution finished successfully.[/]");
    } catch (e: any) {
        AnsiConsole.MarkupLine(`[red]Critical Error:[/] ${e.message}`);
    }
}

main().catch(console.error);
