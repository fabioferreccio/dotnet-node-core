import { IEquatable } from "../Interfaces";

export abstract class ValueObject implements IEquatable<ValueObject> {
    protected abstract GetEqualityComponents(): unknown[];

    public Equals(other: unknown): boolean {
        if (other === null || other === undefined) {
            return false;
        }

        if (!(other instanceof ValueObject)) {
            return false;
        }

        if (this.constructor.name !== other.constructor.name) {
            return false;
        }

        return ValueObject.shallowEqual(this.GetEqualityComponents(), other.GetEqualityComponents());
    }

    protected static shallowEqual(a: unknown[], b: unknown[]): boolean {
        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    }
}
