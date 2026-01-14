export class Console {
    public static WriteLine(value: any): void {
        console.log(value ? value.toString() : "");
    }
}
