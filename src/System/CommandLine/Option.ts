import { Symbol } from "./Symbol";
import { CsString } from "../Types/CsString";
import { CsBoolean } from "../Types/CsBoolean";
import { CsGuid } from "../Types/CsGuid";
import { List } from "../Collections/Generic/List";

/**
 * Represents a named parameter in the command line interface.
 * @experimental This API is in preview and may change.
 */
export class Option<T> extends Symbol {
    private readonly _aliases: List<CsString>;
    private readonly _defaultValue?: T;

    private constructor(
        id: CsGuid,
        name: CsString,
        description: CsString,
        isHidden: CsBoolean,
        aliases: List<CsString>,
        defaultValue?: T,
    ) {
        super(id, name, description, isHidden);
        this._aliases = aliases;
        this._defaultValue = defaultValue;
        Object.freeze(this);
    }

    /**
     * Creates a new option.
     */
    public static From<T>(name: string | CsString, description: string | CsString = "", defaultValue?: T): Option<T> {
        const nameVal = typeof name === "string" ? CsString.From(name) : name;
        const descVal = typeof description === "string" ? CsString.From(description) : description;
        return new Option<T>(
            CsGuid.NewGuid(),
            nameVal,
            descVal,
            CsBoolean.From(false),
            new List<CsString>(),
            defaultValue,
        );
    }

    /**
     * Gets the aliases for the option.
     */
    public get Aliases(): List<CsString> {
        return this._aliases;
    }

    /**
     * Gets the default value for the option.
     */
    public get DefaultValue(): T | undefined {
        return this._defaultValue;
    }

    /**
     * Adds an alias to the option and returns a new instance.
     */
    public AddAlias(alias: string | CsString): Option<T> {
        const aliasVal = typeof alias === "string" ? CsString.From(alias) : alias;
        const newAliases = new List<CsString>(this._aliases.ToArray());
        newAliases.Add(aliasVal);
        return new Option<T>(this._id, this._name, this._description, this._isHidden, newAliases, this._defaultValue);
    }

    /**
     * Sets whether the option is hidden and returns a new instance.
     */
    public SetHidden(isHidden: boolean): Option<T> {
        return new Option<T>(
            this._id,
            this._name,
            this._description,
            CsBoolean.From(isHidden),
            this._aliases,
            this._defaultValue,
        );
    }
}
