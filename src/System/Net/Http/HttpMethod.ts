import { IEquatable } from "../../../Domain/Interfaces";
import { CsString } from "../../../System/Types";

export class HttpMethod implements IEquatable<HttpMethod> {
    private readonly _method: string;

    public get Method(): CsString {
        return CsString.From(this._method);
    }

    public constructor(method: string) {
        if (!method) throw new Error("Method cannot be empty"); // Should be ArgumentException
        this._method = method.toUpperCase();
    }

    public static get Get(): HttpMethod {
        return new HttpMethod("GET");
    }
    public static get Put(): HttpMethod {
        return new HttpMethod("PUT");
    }
    public static get Post(): HttpMethod {
        return new HttpMethod("POST");
    }
    public static get Delete(): HttpMethod {
        return new HttpMethod("DELETE");
    }
    public static get Head(): HttpMethod {
        return new HttpMethod("HEAD");
    }
    public static get Options(): HttpMethod {
        return new HttpMethod("OPTIONS");
    }
    public static get Trace(): HttpMethod {
        return new HttpMethod("TRACE");
    }
    public static get Patch(): HttpMethod {
        return new HttpMethod("PATCH");
    }

    public Equals(other: HttpMethod | null): boolean {
        if (other == null) return false;
        return this._method === other._method;
    }

    public ToString(): CsString {
        return CsString.From(this._method);
    }

    public static get Default(): HttpMethod {
        return HttpMethod.Get;
    }
}
