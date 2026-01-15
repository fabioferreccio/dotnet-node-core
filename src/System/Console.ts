export class Console {
    public static WriteLine(value: unknown): void {
        console.log(value ? value.toString() : "");
    }
}
