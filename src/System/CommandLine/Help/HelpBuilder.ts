import { Command } from "../Command";
import { AnsiConsole } from "../../Console/AnsiConsole";
import { Table } from "../../Console/Table";
import { Panel } from "../../Console/Panel";
import { Rule } from "../../Console/Rule";

/**
 * Generates and renders help text for commands.
 * @experimental This API is in preview and may change.
 */
export class HelpBuilder {
    private readonly _console: AnsiConsole;

    public constructor(console: AnsiConsole) {
        this._console = console;
        Object.freeze(this);
    }

    /**
     * Renders help for the specified command.
     */
    public Write(command: Command): void {
        // 1. Header
        this._console.Write(new Rule(command.Name.ToString()));
        this._console.WriteLine("");

        // 2. Description
        if (command.Description.Length > 0) {
            this._console.Write(new Panel(command.Description.ToString()));
            this._console.WriteLine("");
        }

        // 3. Usage
        this._console.Markup("[yellow]Usage:[/]");
        let usage = ` ${command.Name.ToString()}`;
        if (command.Options.Count > 0) usage += " [options]";
        if (command.Arguments.Count > 0) usage += " [[arguments]]";
        this._console.WriteLine(usage);
        this._console.WriteLine("");

        // 4. Options Table
        if (command.Options.Count > 0) {
            this._console.Markup("[yellow]Options:[/]");
            const table = new Table();
            table.AddColumn("Option");
            table.AddColumn("Description");

            const options = command.Options.ToArray();
            for (const opt of options) {
                if (opt.IsHidden.Value) continue;
                let name = opt.Name.ToString();
                const aliases = opt.Aliases.ToArray();
                for (const alias of aliases) {
                    name += `, ${alias.ToString()}`;
                }
                table.AddRow(name, opt.Description.ToString());
            }
            this._console.Write(table);
            this._console.WriteLine("");
        }

        // 5. Subcommands
        if (command.Subcommands.Count > 0) {
            this._console.Markup("[yellow]Commands:[/]");
            const table = new Table();
            table.AddColumn("Command");
            table.AddColumn("Description");

            const subcommands = command.Subcommands.ToArray();
            for (const sub of subcommands) {
                if (sub.IsHidden.Value) continue;
                table.AddRow(sub.Name.ToString(), sub.Description.ToString());
            }
            this._console.Write(table);
            this._console.WriteLine("");
        }
    }
}
