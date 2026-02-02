import { Option } from "./Option";
import { Argument } from "./Argument";
import { Symbol } from "./Symbol";
import { ParseResult } from "./Parsing/ParseResult";
import { Dictionary } from "../Collections/Generic/Dictionary";
import { CsString } from "../Types/CsString";
import { CsInt32 } from "../Types/CsInt32";
import { CsGuid } from "../Types/CsGuid";

/**
 * Represents the fully resolved, immutable binding result of a command line operation.
 * @experimental This API is in preview and may change.
 */
export class BindingContext {
    private readonly _optionValues: Dictionary<CsGuid, unknown>;
    private readonly _argumentValues: Dictionary<CsGuid, unknown>;

    private constructor(optionValues: Dictionary<CsGuid, unknown>, argumentValues: Dictionary<CsGuid, unknown>) {
        this._optionValues = optionValues;
        this._argumentValues = argumentValues;
        Object.freeze(this);
    }

    /**
     * Creates a BindingContext from a ParseResult by resolving raw tokens.
     */
    public static From(parseResult: ParseResult): BindingContext {
        // [ARCHITECTURE] 'unknown' is used here to allow the dictionary to store polymorphic Cs* types and primitives
        // that are resolved from raw tokens. The runtime safety is enforced by the GetValueFor*<T> methods and casting.
        const optionValues = new Dictionary<CsGuid, unknown>(CsGuid, Object as any);
        const argumentValues = new Dictionary<CsGuid, unknown>(CsGuid, Object as any);

        const command = parseResult.Command;

        // 1. Resolve Options
        const optMatches = parseResult.OptionMatches;
        const options = command.Options.ToArray();
        for (const opt of options) {
            const symbolId = Symbol.GetId(opt);
            const matches = optMatches.Get(symbolId);

            if (matches && matches.Count > 0) {
                // Resolution logic: for now, we take the last value (standard CLI behavior)
                const rawValue = matches.ToArray()[matches.Count - 1];
                optionValues.Add(symbolId, this.ResolveValue(rawValue));
            } else if (opt.DefaultValue !== undefined) {
                optionValues.Add(symbolId, opt.DefaultValue);
            }
        }

        // 2. Resolve Arguments
        const argMatches = parseResult.ArgumentMatches;
        const args = command.Arguments.ToArray();
        for (const arg of args) {
            const symbolId = Symbol.GetId(arg);
            const matches = argMatches.Get(symbolId);

            if (matches && matches.Count > 0) {
                const rawValue = matches.ToArray()[0];
                argumentValues.Add(symbolId, this.ResolveValue(rawValue));
            }
        }

        return new BindingContext(optionValues, argumentValues);
    }

    private static ResolveValue(raw: CsString): unknown {
        const val = raw.ToString().trim();

        // 1. Boolean Resolution
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;

        // 2. CsInt32 Resolution
        if (/^-?\d+$/.test(val)) {
            try {
                return CsInt32.Parse(val);
            } catch {
                throw new Error(`Invalid numeric value: '${val}' is out of range for Int32.`);
            }
        }

        // 3. CsGuid Resolution
        if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) {
            try {
                return CsGuid.Parse(val);
            } catch {
                throw new Error(`Invalid GUID format: '${val}'.`);
            }
        }

        // 4. Fallback to CsString
        return raw;
    }

    /**
     * Gets the value for a specific option.
     */
    public GetValueForOption<T>(option: Option<T>): T | undefined {
        return this._optionValues.Get(Symbol.GetId(option)) as T | undefined;
    }

    /**
     * Gets the value for a specific argument.
     */
    public GetValueForArgument<T>(argument: Argument<T>): T | undefined {
        return this._argumentValues.Get(Symbol.GetId(argument)) as T | undefined;
    }
}
