import { RootCommand } from "../RootCommand";
import { Command } from "../Command";
import { ParseResult } from "./ParseResult";
import { Symbol } from "../Symbol";
import { List } from "../../Collections/Generic/List";
import { Dictionary } from "../../Collections/Generic/Dictionary";
import { CsString } from "../../Types/CsString";
import { CsGuid } from "../../Types/CsGuid";

/**
 * The core engine for structural command line parsing.
 * @experimental This API is in preview and may change.
 */
export class Parser {
    private readonly _rootCommand: RootCommand;

    public constructor(rootCommand: RootCommand) {
        this._rootCommand = rootCommand;
        Object.freeze(this);
    }

    /**
     * Parses the specified command line arguments into a structural result.
     */
    public Parse(argv: string[]): ParseResult {
        let currentCommand: Command = this._rootCommand;
        const errors = new List<CsString>();

        // [ARCHITECTURE] 'any' is used here because current Dictionary implementation requires an explicit
        // type constructor for runtime validation, and List as a generic constructor requires this cast.
        const optionMatches = new Dictionary<CsGuid, List<CsString>>(CsGuid, List as any);
        const argumentMatches = new Dictionary<CsGuid, List<CsString>>(CsGuid, List as any);

        const tokens = [...argv];

        while (tokens.length > 0) {
            const token = tokens.shift()!;

            // 1. Check if token is a subcommand
            let foundSubcommand = false;
            const subcommands = currentCommand.Subcommands.ToArray();
            for (const sub of subcommands) {
                if (sub.Name.ToString() === token) {
                    currentCommand = sub;
                    foundSubcommand = true;
                    break;
                }
            }
            if (foundSubcommand) continue;

            // 2. Check if token is an option
            if (token.startsWith("-")) {
                let foundOption = false;
                const options = currentCommand.Options.ToArray();
                for (const opt of options) {
                    const isNameMatch = opt.Name.ToString() === token;
                    const isAliasMatch = opt.Aliases.ToArray().some((a) => a.ToString() === token);

                    if (isNameMatch || isAliasMatch) {
                        foundOption = true;
                        const symbolId = Symbol.GetId(opt);

                        let matches = optionMatches.Get(symbolId);
                        if (!matches) {
                            matches = new List<CsString>();
                            optionMatches.Add(symbolId, matches);
                        }

                        // For options, we look at the next token as a potential value
                        if (tokens.length > 0 && !tokens[0].startsWith("-")) {
                            matches.Add(CsString.From(tokens.shift()!));
                        } else {
                            // If no value, we store "true" as a raw string for flags
                            matches.Add(CsString.From("true"));
                        }
                        break;
                    }
                }
                if (!foundOption) {
                    errors.Add(CsString.From(`Unknown option: ${token}`));
                }
                continue;
            }

            // 3. Assume it's a positional argument
            const args = currentCommand.Arguments.ToArray();
            if (args.length > 0) {
                const firstArg = args[0];
                const symbolId = Symbol.GetId(firstArg);

                let matches = argumentMatches.Get(symbolId);
                if (!matches) {
                    matches = new List<CsString>();
                    argumentMatches.Add(symbolId, matches);
                    matches.Add(CsString.From(token));
                } else {
                    errors.Add(CsString.From(`Unexpected argument: ${token}`));
                }
            } else {
                errors.Add(CsString.From(`Unexpected argument: ${token}`));
            }
        }

        return new ParseResult(currentCommand, optionMatches, argumentMatches, errors);
    }
}
