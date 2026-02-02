import { CsString } from "../Types/CsString";
import { CsBoolean } from "../Types/CsBoolean";
import { CsGuid } from "../Types/CsGuid";

/**
 * Represents a named entity in the command line interface.
 * @experimental This API is in preview and may change.
 */
export abstract class Symbol {
    protected readonly _id: CsGuid;
    protected readonly _name: CsString;
    protected readonly _description: CsString;
    protected readonly _isHidden: CsBoolean;

    protected constructor(id: CsGuid, name: CsString, description: CsString, isHidden: CsBoolean) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._isHidden = isHidden;
    }

    /**
     * Gets the unique identifier for the symbol.
     */
    protected get Id(): CsGuid {
        return this._id;
    }

    /** @internal */
    public static GetId(symbol: Symbol): CsGuid {
        return symbol.Id;
    }

    /**
     * Gets the name of the symbol.
     */
    public get Name(): CsString {
        return this._name;
    }

    /**
     * Gets the description of the symbol.
     */
    public get Description(): CsString {
        return this._description;
    }

    /**
     * Gets a value indicating whether the symbol is hidden.
     */
    public get IsHidden(): CsBoolean {
        return this._isHidden;
    }
}
