import { Command } from "../Command";
import { List } from "../../Collections/Generic/List";
import { Dictionary } from "../../Collections/Generic/Dictionary";
import { CsString } from "../../Types/CsString";
import { CsBoolean } from "../../Types/CsBoolean";
import { CsGuid } from "../../Types/CsGuid";

/**
 * Represents the result of a parsing operation containing raw token matches.
 * @experimental This API is in preview and may change.
 */
export class ParseResult {
    private readonly _command: Command;
    private readonly _optionMatches: Dictionary<CsGuid, List<CsString>>;
    private readonly _argumentMatches: Dictionary<CsGuid, List<CsString>>;
    private readonly _errors: List<CsString>;

    public constructor(
        command: Command,
        optionMatches: Dictionary<CsGuid, List<CsString>>,
        argumentMatches: Dictionary<CsGuid, List<CsString>>,
        errors: List<CsString>,
    ) {
        this._command = command;
        this._optionMatches = optionMatches;
        this._argumentMatches = argumentMatches;
        this._errors = errors;
        Object.freeze(this);
    }

    /**
     * Gets the parsed command.
     */
    public get Command(): Command {
        return this._command;
    }

    /**
     * Gets the raw matches for options.
     * @internal
     */
    public get OptionMatches(): Dictionary<CsGuid, List<CsString>> {
        return this._optionMatches;
    }

    /**
     * Gets the raw matches for arguments.
     * @internal
     */
    public get ArgumentMatches(): Dictionary<CsGuid, List<CsString>> {
        return this._argumentMatches;
    }

    /**
     * Gets the errors encountered during parsing.
     */
    public get Errors(): List<CsString> {
        return this._errors;
    }

    /**
     * Gets a value indicating whether parsing was successful.
     */
    public get IsSuccessful(): CsBoolean {
        return CsBoolean.From(this._errors.Count === 0);
    }
}
