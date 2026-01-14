import { CsDateTime } from '../../../src/Domain/ValueObjects';

describe('System.DateTime', () => {
    test('Should be immutable', () => {
        // Use local time construction to avoid timezone shifts
        // Year 2023, Month 0 (Jan), Day 1, 12:00:00
        const dt = new CsDateTime(new Date(2023, 0, 1, 12, 0, 0));
        const nextDay = dt.AddDays(1);
        
        expect(dt.Day).toBe(1); 
        expect(nextDay.Day).toBe(2);
        
        // Ensure original didn't change (Day property of original should still be 1)
        expect(dt.AddDays(2).Day).toBe(3);
    });

    test('Date parts should match', () => {
        const date = new CsDateTime(new Date(2023, 4, 20, 10, 30, 0)); // Month 4 is May
        
        expect(date.Year).toBe(2023);
        expect(date.Month).toBe(5); // C# month is 1-based
        expect(date.Day).toBe(20);
        expect(date.Hour).toBe(10);
    });

    test('AddDays returns new instance', () => {
        const date = new CsDateTime(new Date(2023, 4, 20)); // May 20
        const newDate = date.AddDays(5);
        
        expect(date.Day).toBe(20);
        expect(newDate.Day).toBe(25);
        expect(date).not.toBe(newDate);
    });

    test('Today returns date', () => {
        const today = CsDateTime.Today;
        const now = new Date();
        expect(today.Year).toBe(now.getFullYear());
    });
});
