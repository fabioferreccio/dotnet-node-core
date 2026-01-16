import { IEquatable, IComparable } from "../Interfaces";
import { CsString } from "./CsString";
import { CsInt16 } from "./CsInt16";
import { CsInt32 } from "./CsInt32";
import { CsInt64 } from "./CsInt64";
import { CsByte } from "./CsByte";
import { CsSByte } from "./CsSByte";

export class CsBoolean implements IEquatable<CsBoolean>, IComparable<CsBoolean> {
    private readonly _value: boolean;

    // C# constants
    public static readonly TrueString: string = "True";
    public static readonly FalseString: string = "False";

    public constructor(value: boolean | string | number | CsString | CsInt16 | CsInt32 | CsInt64 | CsByte | CsSByte) {
        if (value === null || value === undefined) {
             throw new Error("Value cannot be null or undefined for CsBoolean");
        }

        const result = CsBoolean.TryConvert(value);
        if (result.success) {
            this._value = result.value;
        } else {
            throw new Error(`Invalid type or value for CsBoolean constructor: ${value}`);
        }
    }

    private static TryConvert(value: any): { success: boolean; value: boolean } {
        if (value === null || value === undefined) return { success: false, value: false };

        if (typeof value === "boolean") {
            return { success: true, value: value };
        }
        
        if (typeof value === "string") {
            const s = value.trim().toLowerCase();
            if (s === "true") return { success: true, value: true };
            if (s === "false") return { success: true, value: false };
            return { success: false, value: false };
        }
        
        if (typeof value === "number") {
             return { success: true, value: value !== 0 };
        }
        
        if (value instanceof CsString) {
             const s = value.toString().trim().toLowerCase();
             if (s === "true") return { success: true, value: true };
             if (s === "false") return { success: true, value: false };
             return { success: false, value: false };
        }
        
        if (value instanceof CsInt64) {
             return { success: true, value: value.Value !== 0n };
        }
        
        if (
            value instanceof CsInt32 ||
            value instanceof CsInt16 ||
            value instanceof CsByte ||
            value instanceof CsSByte
        ) {
            return { success: true, value: value.Value !== 0 };
        }

        return { success: false, value: false };
    }

    public get Value(): boolean {
        return this._value;
    }

    public Equals(other: CsBoolean | null): boolean {
        if (!other) return false;
        return this._value === other.Value;
    }

    public CompareTo(other: CsBoolean | null): number {
        if (other === null) return 1;
        if (this._value === other.Value) return 0;
        // False (0) < True (1)
        if (!this._value && other.Value) return -1;
        return 1;
    }

    public ToString(): string {
        return this._value ? CsBoolean.TrueString : CsBoolean.FalseString;
    }

    public toString(): string {
        return this.ToString();
    }

    public valueOf(): boolean {
        return this._value;
    }

    public static Parse(value: boolean | string | number | CsString | CsInt16 | CsInt32 | CsInt64 | CsByte | CsSByte): CsBoolean {
        const result = CsBoolean.TryConvert(value);
        if (result.success) {
            return new CsBoolean(result.value);
        }
        throw new Error(`Value '${value}' was not recognized as a valid Boolean.`);
    }

    public static TryParse(
        value: boolean | string | number | CsString | CsInt16 | CsInt32 | CsInt64 | CsByte | CsSByte,
        result: (val: CsBoolean) => void
    ): boolean {
        const conversion = CsBoolean.TryConvert(value);
        if (conversion.success) {
            result(new CsBoolean(conversion.value));
            return true;
        }
        return false;
    }
}
