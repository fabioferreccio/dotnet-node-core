import { CsString } from '../../../src/Domain/ValueObjects';

describe('CsString Value Object', () => {
    test('Should be structurally equal', () => {
        const str1 = new CsString("hello");
        const str2 = new CsString("hello");
        expect(str1.Equals(str2)).toBe(true);
    });

    test('Should be immutable on Trim', () => {
        const original = new CsString("  hello  ");
        const trimmed = original.Trim();
        
        expect(original.toString()).toBe("  hello  ");
        expect(trimmed.toString()).toBe("hello");
        expect(original).not.toBe(trimmed);
    });

    test('Should be immutable on ToUpper', () => {
        const original = new CsString("hello");
        const upper = original.ToUpper();

        expect(original.toString()).toBe("hello");
        expect(upper.toString()).toBe("HELLO");
        expect(original).not.toBe(upper);
    });

    test('Should use length property', () => {
        const str = new CsString("hello");
        expect(str.Length).toBe(5);
    });
});
