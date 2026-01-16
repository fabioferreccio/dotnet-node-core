import { IEquatable } from "../../Domain/Interfaces";
import * as crypto from "crypto";

export class CsGuid implements IEquatable<CsGuid> {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value.toLowerCase();
        Object.freeze(this);
    }

    public static NewGuid(): CsGuid {
        return new CsGuid(crypto.randomUUID());
    }

    public static get Empty(): CsGuid {
        return new CsGuid("00000000-0000-0000-0000-000000000000");
    }

    public static Parse(input: string): CsGuid {
        if (this.TryParse(input, null)) {
            return new CsGuid(input);
        }
        throw new Error("Invalid GUID format");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static TryParse(input: string, result?: unknown): boolean {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(input);
    }

    public ToString(): string {
        return this._value;
    }

    public Equals(other: CsGuid): boolean {
        if (!other) return false;
        return this._value === other.ToString();
    }
}
