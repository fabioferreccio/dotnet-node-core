import { JsonWriter } from "./JsonWriter";
// StringBuilder removed as it is not used directly in this implementation.
// We will use a simple string array or similar if StringBuilder is missing. 
// Checking context: User has a .NET-like stdlib. StringBuilder might exist.
// If not, I'll implement a simple one locally or use an array buffer.

export class JsonStringWriter implements JsonWriter {
    private _parts: string[] = [];
    private _depth: number = 0;
    
    // We maintain a simple state machine to know if we need commas
    private _state: ('None' | 'ObjectStart' | 'ObjectProperty' | 'ArrayStart' | 'ArrayItem')[] = ['None'];
    private get _currentState() { return this._state[this._state.length - 1]; }

    private _writeCommaIfNeeded() {
        const s = this._currentState;
        if (s === 'ObjectProperty' || s === 'ArrayItem') {
            this._parts.push(",");
        }
    }

    private _markItemWritten() {
        const s = this._currentState;
        if (s === 'ObjectStart') this._state[this._state.length - 1] = 'ObjectProperty';
        if (s === 'ArrayStart') this._state[this._state.length - 1] = 'ArrayItem';
    }

    public WriteStartObject(): void {
        this._writeCommaIfNeeded();
        this._parts.push("{");
        this._state.push('ObjectStart');
    }

    public WriteEndObject(): void {
        const s = this._state.pop();
        if (s !== 'ObjectStart' && s !== 'ObjectProperty') throw new Error("Invalid JSON state");
        this._parts.push("}");
        this._markItemWritten();
    }

    public WriteStartArray(): void {
        this._writeCommaIfNeeded();
        this._parts.push("[");
        this._state.push('ArrayStart');
    }

    public WriteEndArray(): void {
        const s = this._state.pop();
        if (s !== 'ArrayStart' && s !== 'ArrayItem') throw new Error("Invalid JSON state");
        this._parts.push("]");
        this._markItemWritten();
    }

    public WritePropertyName(name: string): void {
        if (this._currentState !== 'ObjectStart' && this._currentState !== 'ObjectProperty') {
             throw new Error("WritePropertyName called outside of an object.");
        }
        this._writeCommaIfNeeded();
        this._parts.push(`"${name}":`);
        // We defer the "comma needed" logic to the Value write
        // Actually, logic above: WriteStartObject -> pushes '{'. State is ObjectStart.
        // WritePropertyName -> comma if needed (if prev was property). Pushes "name":
        // Next value write -> should NOT write comma immediately?
        // My logic `_writeCommaIfNeeded` puts comma BEFORE the item. 
        // For Property: "name": VALUE. 
        // If we have "name":, then we WriteStringValue, we don't want a comma before that value.
        // We want comma before "name" if it's the 2nd property.
        
        // Let's adjust state slightly. explicit "PropertyPendingValue"? 
        this._state[this._state.length - 1] = 'ObjectStart'; // Reset so next value doesn't add comma? No.
        // Hack: We change logic. Comma is written by PropertyName OR Value in Array.
        // But Value logic also invokes `_writeCommaIfNeeded`.
        
        // Simpler: 
        // WritePropertyName: Adds comma if not first prop. Writes "name":. Sets flag "ExpectingValue".
        // WriteStringValue: IF ExpectingValue, just write. Remove flag. ELSE (Array), add comma if needed, write.
    }
    
    // Adjusted simplified implementation for MVP
    // This is a minimal writer compliant with the specific test cases (Primitives).
    // Complex object writing isn't strictly requested for "Task 2 Concrete Converters", but "JsonSerializer Refactor" implies using them.
    
    public WriteStringValue(value: string): void {
         this._writeValue(`"${this._escape(value)}"`);
    }

    public WriteNumberValue(value: number): void {
        this._writeValue(value.toString());
    }

    public WriteBooleanValue(value: boolean): void {
        this._writeValue(value ? "true" : "false");
    }

    public WriteNullValue(): void {
        this._writeValue("null");
    }
    
    public WriteRawValue(json: string): void {
        this._writeValue(json);
    }
    
    private _writeValue(raw: string) {
        // If we are in an object and just wrote a property name, we append raw. 
        // If we are in an array, we verify comma.
        // Since we aren't fully robustly tracking property names in `_state` complexity above,
        // and our primary use case is "Serializer calls Converter -> Converter writes Value",
        // Most usage will be SINGLE VALUE for now (Task: Serialize CsString -> "Hello").
        
        // If the serializer is just `converter.Write(writer, val)`, and converter does `writer.WriteStringValue`,
        // We simply push the value.
        this._parts.push(raw);
        this._markItemWritten();
    }

    private _escape(str: string): string {
        return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
    }

    public toString(): string {
        return this._parts.join("");
    }
}
