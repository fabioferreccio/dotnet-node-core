import { Symbol } from "./Symbol";
import { CsString } from "../Types/CsString";
import { CsBoolean } from "../Types/CsBoolean";
import { CsGuid } from "../Types/CsGuid";
import { CsInt32 } from "../Types/CsInt32";

/**
 * Represents a positional value in the command line interface.
 * @experimental This API is in preview and may change.
 */
export class Argument<T> extends Symbol {
    private readonly _minArity: CsInt32;
    private readonly _maxArity: CsInt32;

    private constructor(
        id: CsGuid,
        name: CsString,
        description: CsString,
        isHidden: CsBoolean,
        minArity: CsInt32,
        maxArity: CsInt32,
    ) {
        super(id, name, description, isHidden);
        this._minArity = minArity;
        this._maxArity = maxArity;
        Object.freeze(this);
    }

    /**
     * Creates a new argument.
     */
    public static From<T>(name: string | CsString, description: string | CsString = ""): Argument<T> {
        const nameVal = typeof name === "string" ? CsString.From(name) : name;
        const descVal = typeof description === "string" ? CsString.From(description) : description;
        return new Argument<T>(
            CsGuid.NewGuid(),
            nameVal,
            descVal,
            CsBoolean.From(false),
            CsInt32.From(0),
            CsInt32.From(1),
        );
    }

    /**
     * Gets the minimum number of values required for the argument.
     */
    public get MinArity(): CsInt32 {
        return this._minArity;
    }

    /**
     * Gets the maximum number of values allowed for the argument.
     */
    public get MaxArity(): CsInt32 {
        return this._maxArity;
    }

    /**
     * Sets the arity for the argument and returns a new instance.
     */
    public SetArity(min: number, max: number): Argument<T> {
        return new Argument<T>(
            this._id,
            this._name,
            this._description,
            this._isHidden,
            CsInt32.From(min),
            CsInt32.From(max),
        );
    }

    /**
     * Sets whether the argument is hidden and returns a new instance.
     */
    public SetHidden(isHidden: boolean): Argument<T> {
        return new Argument<T>(
            this._id,
            this._name,
            this._description,
            CsBoolean.From(isHidden),
            this._minArity,
            this._maxArity,
        );
    }
}
