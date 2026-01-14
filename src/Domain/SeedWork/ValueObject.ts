import { IEquatable } from '../Shared/IEquatable';

export abstract class ValueObject implements IEquatable<ValueObject> {
    
    protected abstract GetEqualityComponents(): any[];

    public Equals(other: ValueObject): boolean {
        if (other === null || other === undefined) {
            return false;
        }

        if (this.constructor.name !== other.constructor.name) {
            return false;
        }

        return ValueObject.shallowEqual(this.GetEqualityComponents(), other.GetEqualityComponents());
    }

    protected static shallowEqual(a: any[], b: any[]): boolean {
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
