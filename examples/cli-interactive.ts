import { System } from "../src/index";
const { CommandLine, Console, AnsiConsole } = System;

async function main() {
    AnsiConsole.Configure({ width: 80 });

    const rootCommand = new CommandLine.RootCommand("Interactive Demo")
        .SetHandler(async (context) => {
            AnsiConsole.MarkupLine("[yellow]Welcome to the Interactive Demo![/]");
            
            AnsiConsole.Markup("[blue]Please enter your name: [/]");
            const name = Console.In.ReadLine();
            
            if (name) {
                AnsiConsole.MarkupLine(`[green]Hello, ${name}![/]`);
            } else {
                AnsiConsole.MarkupLine("[red]No name entered.[/]");
            }
        });

    const argv: string[] = [];

    // Canonical Pipeline
    const parser = new CommandLine.Parser(rootCommand);
    const parseResult = parser.Parse(argv);

    if (parseResult.IsSuccessful.Value) {
        const bindingContext = CommandLine.BindingContext.From(parseResult);
        const invocationContext = new CommandLine.InvocationContext(bindingContext, parseResult.Command, {} as any);
        
        if (parseResult.Command.Handler) {
            await parseResult.Command.Handler(invocationContext);
        }
    }
}

main().catch(console.error);
